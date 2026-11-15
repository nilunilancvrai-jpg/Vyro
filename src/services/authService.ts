import {
  ConfirmationResult,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import {
  auth,
  authEmulatorUrl,
  db,
  googleAuthProvider,
  handleFirestoreError,
  isAuthEmulatorEnabled,
  OperationType,
} from '../lib/firebase';
import { UserRole } from '../types';
import {
  BusinessAddressRecord,
  BusinessRecord,
  BusinessVerificationRecord,
  FullUserAccount,
  OnboardingDraft,
  ProfileRecord,
  UserPreferenceRecord,
} from '../types/onboarding';

export interface AuthErrorGuidance {
  message: string;
  code: string;
  needsConsoleConfig?: boolean;
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function isRecaptchaAlreadyRenderedError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err ?? '');
  return msg.toLowerCase().includes('already been rendered');
}

export function mapFirebaseAuthError(err: unknown): AuthErrorGuidance {
  const errorObj = err as { code?: string; message?: string };
  const code = errorObj?.code || 'unknown';

  if (isRecaptchaAlreadyRenderedError(err)) {
    return {
      code: 'recaptcha-already-rendered',
      message: 'Security verification was reset cleanly. Please tap Send 6-Digit OTP again.',
    };
  }

  switch (code) {
    case 'auth/invalid-phone-number':
      return { code, message: 'The mobile number format is invalid. Please include country code +91 and 10 digits.' };
    case 'auth/missing-phone-number':
      return { code, message: 'Please enter your mobile number to receive an OTP.' };
    case 'auth/invalid-verification-code':
      return { code, message: 'Incorrect 6-digit OTP. Please check the SMS and try again.' };
    case 'auth/code-expired':
      return { code, message: 'This OTP has expired. Please request a new OTP.' };
    case 'auth/too-many-requests':
      return { code, message: 'Too many OTP attempts. Please wait a minute before trying again.' };
    case 'auth/quota-exceeded':
      return {
        code,
        message: 'SMS OTP daily quota exceeded in Firebase Authentication. Use a configured Firebase test number or check project SMS quota.',
        needsConsoleConfig: true,
      };
    case 'auth/operation-not-allowed':
      return {
        code,
        message: 'Phone Authentication is not enabled yet in Firebase Console (Authentication -> Sign-in method -> Phone).',
        needsConsoleConfig: true,
      };
    case 'auth/billing-not-enabled':
      return {
        code,
        message: 'Firebase SMS requires Blaze billing or configured Firebase Test Phone Numbers in Firebase Console.',
        needsConsoleConfig: true,
      };
    case 'auth/unauthorized-domain':
      return {
        code,
        message: 'This preview domain is not yet added to Firebase Authorized Domains in Authentication Settings.',
        needsConsoleConfig: true,
      };
    case 'auth/invalid-app-credential':
      return {
        code,
        message: 'reCAPTCHA app verification could not be validated for this domain. Please try again or check Authorized Domains.',
        needsConsoleConfig: true,
      };
    case 'auth/captcha-check-failed':
      return {
        code,
        message: 'reCAPTCHA verification failed or expired. Please try sending the OTP again.',
      };
    case 'auth/emulator-config-failed':
      return {
        code,
        message: 'Firebase Auth Emulator configuration failed. Verify VITE_FIREBASE_AUTH_EMULATOR_URL and restart the dev server.',
      };
    case 'auth/network-request-failed':
      if (isAuthEmulatorEnabled) {
        return {
          code,
          message: `Cannot reach local Firebase Auth Emulator at ${authEmulatorUrl}. Start it with: npm run emulators:auth`,
        };
      }
      return {
        code,
        message: 'Network error while contacting Firebase Authentication. Check your connection and retry.',
      };
    case 'auth/internal-error':
      return {
        code,
        message: 'Authentication security check encountered an error. Please try sending the OTP again.',
      };
    case 'auth/popup-closed-by-user':
      return { code, message: 'Sign-in window was closed before completion.' };
    default:
      return {
        code,
        message: errorObj?.message || 'Authentication failed. Please try again.',
      };
  }
}

interface ManagedRecaptchaState {
  verifier: RecaptchaVerifier | null;
  hostEl: HTMLElement | null;
  slotEl: HTMLElement | null;
  widgetId: number | null;
  expired: boolean;
  destroyed: boolean;
  initPromise: Promise<RecaptchaVerifier> | null;
}

const recaptchaState: ManagedRecaptchaState = {
  verifier: null,
  hostEl: null,
  slotEl: null,
  widgetId: null,
  expired: false,
  destroyed: false,
  initPromise: null,
};

export interface RecaptchaLifecycleCallbacks {
  onExpired?: () => void;
  onError?: () => void;
}

export function destroyActiveRecaptcha(hostEl?: HTMLElement | null): void {
  const currentVerifier = recaptchaState.verifier;
  const currentSlot = recaptchaState.slotEl;
  const currentHost = hostEl ?? recaptchaState.hostEl;

  recaptchaState.verifier = null;
  recaptchaState.slotEl = null;
  recaptchaState.hostEl = null;
  recaptchaState.widgetId = null;
  recaptchaState.expired = false;
  recaptchaState.destroyed = true;
  recaptchaState.initPromise = null;

  if (currentVerifier) {
    try {
      currentVerifier.clear();
    } catch {
      // Ignore if Firebase already cleared or destroyed this verifier
    }
  }

  if (currentSlot && currentSlot.parentNode) {
    try {
      currentSlot.parentNode.removeChild(currentSlot);
    } catch {
      // Ignore detached DOM errors
    }
  }

  if (currentHost) {
    try {
      currentHost.replaceChildren();
    } catch {
      // Ignore if host already unmounted
    }
  }
}

export async function ensureRecaptchaVerifier(
  hostEl: HTMLElement | null,
  callbacks?: RecaptchaLifecycleCallbacks
): Promise<RecaptchaVerifier> {
  if (!hostEl || !hostEl.isConnected) {
    throw new Error('reCAPTCHA container is not mounted in the DOM.');
  }

  // Reuse existing active verifier when it belongs to the same mounted host and has not expired
  if (
    recaptchaState.verifier &&
    !recaptchaState.destroyed &&
    !recaptchaState.expired &&
    recaptchaState.hostEl === hostEl &&
    recaptchaState.slotEl?.isConnected
  ) {
    return recaptchaState.verifier;
  }

  // Deduplicate concurrent initialization calls for the same mounted host
  if (recaptchaState.initPromise && recaptchaState.hostEl === hostEl) {
    return recaptchaState.initPromise;
  }

  // Cleanly tear down any previous/expired verifier and clear old DOM slot before creating a new one
  destroyActiveRecaptcha(hostEl);

  const slotEl = document.createElement('div');
  slotEl.setAttribute('data-vyro-recaptcha-slot', 'active');
  hostEl.replaceChildren(slotEl);

  recaptchaState.hostEl = hostEl;
  recaptchaState.slotEl = slotEl;
  recaptchaState.destroyed = false;
  recaptchaState.expired = false;

  const verifier = new RecaptchaVerifier(auth, slotEl, {
    size: 'invisible',
    'expired-callback': () => {
      recaptchaState.expired = true;
      // Safely reset widget if available, or allow clean rebuild on next OTP send
      const grecaptcha = (window as unknown as { grecaptcha?: { reset?: (id?: number) => void } }).grecaptcha;
      if (grecaptcha?.reset && recaptchaState.widgetId !== null) {
        try {
          grecaptcha.reset(recaptchaState.widgetId);
          recaptchaState.expired = false;
        } catch {
          destroyActiveRecaptcha(recaptchaState.hostEl);
        }
      } else {
        destroyActiveRecaptcha(recaptchaState.hostEl);
      }
      callbacks?.onExpired?.();
    },
    'error-callback': () => {
      destroyActiveRecaptcha(recaptchaState.hostEl);
      callbacks?.onError?.();
    },
  });

  recaptchaState.verifier = verifier;

  const promise = verifier
    .render()
    .then((widgetId) => {
      // If component unmounted or reset while render() was resolving, discard cleanly
      if (recaptchaState.verifier !== verifier || !hostEl.isConnected || !slotEl.isConnected) {
        try {
          verifier.clear();
        } catch {
          // Ignore
        }
        throw new Error('reCAPTCHA initialization cancelled because container unmounted.');
      }
      recaptchaState.widgetId = widgetId;
      recaptchaState.initPromise = null;
      return verifier;
    })
    .catch((err) => {
      if (recaptchaState.verifier === verifier) {
        destroyActiveRecaptcha(hostEl);
      }
      throw err;
    });

  recaptchaState.initPromise = promise;
  return promise;
}

export async function sendPhoneOtp(
  e164Phone: string,
  verifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  return signInWithPhoneNumber(auth, e164Phone, verifier);
}

export async function verifyPhoneOtp(
  confirmationResult: ConfirmationResult,
  otpCode: string
): Promise<User> {
  const cred = await confirmationResult.confirm(otpCode);
  return cred.user;
}

export async function signInWithGoogleFallback(): Promise<User> {
  const cred = await signInWithPopup(auth, googleAuthProvider);
  return cred.user;
}

export async function verifySessionWithBackend(user: User) {
  const idToken = await user.getIdToken();
  const res = await fetch('/api/auth/verify-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
  });
  if (!res.ok) {
    throw new Error('Failed to verify authentication session with VYRO server.');
  }
  return res.json();
}

export async function validatePanWithBackend(user: User, pan: string, consent: boolean) {
  const idToken = await user.getIdToken();
  const res = await fetch('/api/validation/pan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ pan, consent }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'PAN validation failed.');
  }
  return data as { valid: boolean; panMasked: string; panHash: string };
}

export async function validateOnboardingWithBackend(user: User, payload: Record<string, unknown>) {
  const idToken = await user.getIdToken();
  const res = await fetch('/api/validation/onboarding', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    const firstErr = data.errors ? Object.values(data.errors)[0] : data.error;
    throw new Error(String(firstErr || 'Server validation failed.'));
  }
  return data;
}

export async function fetchUserAccount(uid: string): Promise<FullUserAccount | null> {
  const profilePath = `profiles/${uid}`;
  let profileSnap;
  try {
    profileSnap = await getDoc(doc(db, 'profiles', uid));
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, profilePath);
  }

  if (!profileSnap.exists()) {
    return null;
  }

  const profile = profileSnap.data() as ProfileRecord;

  const [bizSnap, addrSnap, verifSnap, prefSnap] = await Promise.all([
    getDoc(doc(db, 'businesses', uid)).catch((err) => handleFirestoreError(err, OperationType.GET, `businesses/${uid}`)),
    getDoc(doc(db, 'business_addresses', uid)).catch((err) =>
      handleFirestoreError(err, OperationType.GET, `business_addresses/${uid}`)
    ),
    getDoc(doc(db, 'business_verifications', uid)).catch((err) =>
      handleFirestoreError(err, OperationType.GET, `business_verifications/${uid}`)
    ),
    getDoc(doc(db, 'user_preferences', uid)).catch((err) =>
      handleFirestoreError(err, OperationType.GET, `user_preferences/${uid}`)
    ),
  ]);

  return {
    profile,
    business: bizSnap.exists() ? (bizSnap.data() as BusinessRecord) : null,
    address: addrSnap.exists() ? (addrSnap.data() as BusinessAddressRecord) : null,
    verification: verifSnap.exists() ? (verifSnap.data() as BusinessVerificationRecord) : null,
    preferences: prefSnap.exists() ? (prefSnap.data() as UserPreferenceRecord) : null,
  };
}

export async function saveStep1Personal(
  user: User,
  role: UserRole,
  draft: OnboardingDraft,
  existingProfile: ProfileRecord | null
): Promise<ProfileRecord> {
  const uid = user.uid;
  const phoneNumber = (user.phoneNumber || draft.phoneNumber).trim();
  const phoneHash = await sha256Hex(phoneNumber);

  // Check phone uniqueness before creating profile if new
  if (!existingProfile) {
    const regRef = doc(db, 'phone_registry', phoneHash);
    try {
      const regSnap = await getDoc(regRef);
      if (regSnap.exists() && regSnap.data().uid !== uid) {
        throw new Error('This mobile number is already registered with another VYRO account.');
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes('already registered')) {
        throw err;
      }
      // Permission denied on get means another user owns this phone_registry document
      throw new Error('This mobile number is already registered to an existing VYRO business account.');
    }
  }

  const profileRef = doc(db, 'profiles', uid);
  const nextStep = existingProfile ? Math.max(existingProfile.onboardingStep, 2) : 2;

  if (!existingProfile) {
    const batch = writeBatch(db);
    const newProfile: ProfileRecord = {
      uid,
      role,
      phoneNumber,
      fullName: draft.fullName.trim(),
      email: draft.email.trim(),
      ...(draft.photoUrl ? { photoUrl: draft.photoUrl } : {}),
      ...(draft.dateOfBirth ? { dateOfBirth: draft.dateOfBirth } : {}),
      ...(draft.gender ? { gender: draft.gender } : {}),
      onboardingCompleted: false,
      onboardingStep: 2,
      accountStatus: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    batch.set(profileRef, newProfile);
    batch.set(doc(db, 'phone_registry', phoneHash), {
      phoneHash,
      uid,
      role,
      createdAt: serverTimestamp(),
    });
    try {
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, profileRef.path);
    }
    return newProfile;
  } else {
    const updates: {
      fullName: string;
      email: string;
      photoUrl: string;
      dateOfBirth: string;
      gender: ProfileRecord['gender'];
      onboardingStep: number;
      updatedAt: ReturnType<typeof serverTimestamp>;
    } = {
      fullName: draft.fullName.trim(),
      email: draft.email.trim(),
      photoUrl: draft.photoUrl || '',
      dateOfBirth: draft.dateOfBirth || '',
      gender: draft.gender || '',
      onboardingStep: nextStep,
      updatedAt: serverTimestamp(),
    };
    try {
      await updateDoc(profileRef, updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, profileRef.path);
    }
    return {
      ...existingProfile,
      ...updates,
    };
  }
}

export async function saveStep2Business(
  user: User,
  role: UserRole,
  draft: OnboardingDraft,
  existingBusiness: BusinessRecord | null,
  advanceStep = true
): Promise<BusinessRecord> {
  const uid = user.uid;
  const bizRef = doc(db, 'businesses', uid);
  const last4 = draft.includeBankDetails
    ? draft.bankAccountNumber.replace(/\D/g, '').slice(-4) || draft.bankAccountLast4
    : '';

  if (!existingBusiness) {
    const payload: BusinessRecord = {
      uid,
      role,
      businessName: draft.businessName.trim(),
      businessType: draft.businessType.trim(),
      businessCategory: draft.businessCategory.trim(),
      gstin: draft.gstin.trim().toUpperCase(),
      registrationNumber: draft.registrationNumber.trim(),
      apmcLicense: draft.apmcLicense.trim(),
      logoUrl: draft.logoUrl || '',
      facilityPhotoUrl: draft.facilityPhotoUrl || '',
      bankAccountHolder: draft.includeBankDetails ? draft.bankAccountHolder.trim() : '',
      bankAccountLast4: last4,
      bankIfsc: draft.includeBankDetails ? draft.bankIfsc.trim().toUpperCase() : '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    try {
      await setDoc(bizRef, payload);
      if (advanceStep) {
        await updateDoc(doc(db, 'profiles', uid), {
          onboardingStep: 3,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, bizRef.path);
    }
    return payload;
  } else {
    const updates = {
      businessName: draft.businessName.trim(),
      businessType: draft.businessType.trim(),
      businessCategory: draft.businessCategory.trim(),
      gstin: draft.gstin.trim().toUpperCase(),
      registrationNumber: draft.registrationNumber.trim(),
      apmcLicense: draft.apmcLicense.trim(),
      logoUrl: draft.logoUrl || '',
      facilityPhotoUrl: draft.facilityPhotoUrl || '',
      bankAccountHolder: draft.includeBankDetails ? draft.bankAccountHolder.trim() : '',
      bankAccountLast4: last4,
      bankIfsc: draft.includeBankDetails ? draft.bankIfsc.trim().toUpperCase() : '',
      updatedAt: serverTimestamp(),
    };
    try {
      await updateDoc(bizRef, updates);
      if (advanceStep) {
        await updateDoc(doc(db, 'profiles', uid), {
          onboardingStep: 3,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, bizRef.path);
    }
    return {
      ...existingBusiness,
      ...updates,
    };
  }
}

export async function saveStep3Address(
  user: User,
  role: UserRole,
  draft: OnboardingDraft,
  existingAddress: BusinessAddressRecord | null,
  advanceStep = true
): Promise<BusinessAddressRecord> {
  const uid = user.uid;
  const addrRef = doc(db, 'business_addresses', uid);

  const bizFields = draft.businessSameAsResidential
    ? {
        businessCountry: draft.residentialCountry,
        businessState: draft.residentialState,
        businessDistrict: draft.residentialDistrict,
        businessCity: draft.residentialCity,
        businessLocality: draft.residentialLocality,
        businessStreet: draft.residentialStreet,
        businessPincode: draft.residentialPincode,
      }
    : {
        businessCountry: draft.businessCountry,
        businessState: draft.businessState,
        businessDistrict: draft.businessDistrict,
        businessCity: draft.businessCity,
        businessLocality: draft.businessLocality,
        businessStreet: draft.businessStreet,
        businessPincode: draft.businessPincode,
      };

  const warehouseFields =
    role === 'wholesaler'
      ? draft.warehouseSameAsBusiness
        ? {
            warehouseSameAsBusiness: true,
            warehouseStreet: bizFields.businessStreet,
            warehouseCity: bizFields.businessCity,
            warehouseState: bizFields.businessState,
            warehousePincode: bizFields.businessPincode,
          }
        : {
            warehouseSameAsBusiness: false,
            warehouseStreet: draft.warehouseStreet.trim(),
            warehouseCity: draft.warehouseCity.trim(),
            warehouseState: draft.warehouseState.trim(),
            warehousePincode: draft.warehousePincode.trim(),
          }
      : {
          warehouseSameAsBusiness: true,
          warehouseStreet: '',
          warehouseCity: '',
          warehouseState: '',
          warehousePincode: '',
        };

  if (!existingAddress) {
    const payload: BusinessAddressRecord = {
      uid,
      residentialCountry: draft.residentialCountry,
      residentialState: draft.residentialState,
      residentialDistrict: draft.residentialDistrict,
      residentialCity: draft.residentialCity.trim(),
      residentialLocality: draft.residentialLocality.trim(),
      residentialStreet: draft.residentialStreet.trim(),
      residentialPincode: draft.residentialPincode.trim(),
      businessSameAsResidential: draft.businessSameAsResidential,
      ...bizFields,
      ...warehouseFields,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    try {
      await setDoc(addrRef, payload);
      if (advanceStep) {
        await updateDoc(doc(db, 'profiles', uid), {
          onboardingStep: 4,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, addrRef.path);
    }
    return payload;
  } else {
    const updates = {
      residentialCountry: draft.residentialCountry,
      residentialState: draft.residentialState,
      residentialDistrict: draft.residentialDistrict,
      residentialCity: draft.residentialCity.trim(),
      residentialLocality: draft.residentialLocality.trim(),
      residentialStreet: draft.residentialStreet.trim(),
      residentialPincode: draft.residentialPincode.trim(),
      businessSameAsResidential: draft.businessSameAsResidential,
      ...bizFields,
      ...warehouseFields,
      updatedAt: serverTimestamp(),
    };
    try {
      await updateDoc(addrRef, updates);
      if (advanceStep) {
        await updateDoc(doc(db, 'profiles', uid), {
          onboardingStep: 4,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, addrRef.path);
    }
    return {
      ...existingAddress,
      ...updates,
    };
  }
}

export async function saveStep4Verification(
  user: User,
  draft: OnboardingDraft,
  existingVerification: BusinessVerificationRecord | null,
  advanceStep = true
): Promise<BusinessVerificationRecord> {
  const uid = user.uid;
  const verRef = doc(db, 'business_verifications', uid);

  let panMasked = draft.panMasked;
  let panHash = draft.panHash;
  const panProvided = Boolean(draft.panInput.trim() || panMasked);

  if (draft.panInput.trim()) {
    const validated = await validatePanWithBackend(user, draft.panInput, draft.panPurposeConsent);
    panMasked = validated.panMasked;
    panHash = validated.panHash;
  }

  const kycStatus: 'unverified' | 'pending_review' =
    panProvided || draft.aadhaarMethod !== 'none' ? 'pending_review' : 'unverified';

  if (!existingVerification) {
    const payload: BusinessVerificationRecord = {
      uid,
      panProvided,
      panMasked: panMasked || '',
      panHash: panHash || '',
      panPurposeConsent: draft.panPurposeConsent,
      aadhaarMethod: draft.aadhaarMethod,
      aadhaarConsent: draft.aadhaarConsent,
      aadhaarVerified: false,
      kycStatus,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    try {
      await setDoc(verRef, payload);
      if (advanceStep) {
        await updateDoc(doc(db, 'profiles', uid), {
          onboardingStep: 5,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, verRef.path);
    }
    return payload;
  } else {
    const updates = {
      panProvided,
      panMasked: panMasked || '',
      panHash: panHash || '',
      panPurposeConsent: draft.panPurposeConsent,
      aadhaarMethod: draft.aadhaarMethod,
      aadhaarConsent: draft.aadhaarConsent,
      kycStatus,
      updatedAt: serverTimestamp(),
    };
    try {
      await updateDoc(verRef, updates);
      if (advanceStep) {
        await updateDoc(doc(db, 'profiles', uid), {
          onboardingStep: 5,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, verRef.path);
    }
    return {
      ...existingVerification,
      ...updates,
    };
  }
}

export async function completeStep5Registration(
  user: User,
  role: UserRole,
  draft: OnboardingDraft
): Promise<FullUserAccount> {
  await validateOnboardingWithBackend(user, {
    role,
    fullName: draft.fullName,
    phoneNumber: user.phoneNumber || draft.phoneNumber,
    email: draft.email,
    businessName: draft.businessName,
    gstin: draft.gstin,
    bankIfsc: draft.includeBankDetails ? draft.bankIfsc : '',
    residentialPincode: draft.residentialPincode,
    businessPincode: draft.businessSameAsResidential
      ? draft.residentialPincode
      : draft.businessPincode,
  });

  const uid = user.uid;
  const prefRef = doc(db, 'user_preferences', uid);
  const existingPref = await getDoc(prefRef).catch((err) =>
    handleFirestoreError(err, OperationType.GET, prefRef.path)
  );

  const batch = writeBatch(db);
  batch.update(doc(db, 'profiles', uid), {
    onboardingCompleted: true,
    onboardingStep: 5,
    updatedAt: serverTimestamp(),
  });

  if (!existingPref.exists()) {
    batch.set(prefRef, {
      uid,
      whatsappAlerts: true,
      smsOrderAlerts: true,
      emailInvoices: true,
      lowStockThresholdDefault: 15,
      language: 'English (India)',
      updatedAt: serverTimestamp(),
    });
  }

  try {
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `profiles/${uid}`);
  }

  const fullAccount = await fetchUserAccount(uid);
  if (!fullAccount) {
    throw new Error('Could not reload saved account after registration.');
  }
  return fullAccount;
}

export async function updateUserPreferences(
  uid: string,
  prefs: Omit<UserPreferenceRecord, 'uid' | 'updatedAt'>
): Promise<void> {
  const prefRef = doc(db, 'user_preferences', uid);
  const snap = await getDoc(prefRef).catch((err) =>
    handleFirestoreError(err, OperationType.GET, prefRef.path)
  );
  try {
    if (!snap.exists()) {
      await setDoc(prefRef, {
        uid,
        ...prefs,
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(prefRef, {
        ...prefs,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, prefRef.path);
  }
}

export async function requestAccountDeletion(user: User, reason: string): Promise<void> {
  const idToken = await user.getIdToken();
  const res = await fetch('/api/account/delete-request', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Could not submit account deletion request.');
  }

  const batch = writeBatch(db);
  batch.set(doc(db, 'deletion_requests', user.uid), {
    uid: user.uid,
    reason: reason.trim(),
    status: 'requested',
    requestedAt: serverTimestamp(),
  });
  batch.update(doc(db, 'profiles', user.uid), {
    accountStatus: 'pending_deletion',
    updatedAt: serverTimestamp(),
  });

  try {
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `deletion_requests/${user.uid}`);
  }
}

export async function signOutAccount(): Promise<void> {
  clearPendingAuthRole();
  await signOut(auth);
}

const PENDING_ROLE_KEY = 'vyro_pending_auth_role';

export function getPendingAuthRole(): UserRole | null {
  try {
    const val = window.sessionStorage.getItem(PENDING_ROLE_KEY);
    return val === 'retailer' || val === 'wholesaler' ? val : null;
  } catch {
    return null;
  }
}

export function setPendingAuthRole(role: UserRole): void {
  try {
    window.sessionStorage.setItem(PENDING_ROLE_KEY, role);
  } catch {
    // Ignore storage errors
  }
}

export function clearPendingAuthRole(): void {
  try {
    window.sessionStorage.removeItem(PENDING_ROLE_KEY);
  } catch {
    // Ignore storage errors
  }
}

/**
 * Shared post-authentication check used identically by both Phone OTP and Google Sign-In:
 * 1. Verifies Firebase ID token with VYRO backend (/api/auth/verify-session)
 * 2. Loads user profile & business registration state from Firestore
 */
export async function resolveAuthenticatedAccount(
  user: User
): Promise<FullUserAccount | null> {
  await verifySessionWithBackend(user);
  return fetchUserAccount(user.uid);
}
