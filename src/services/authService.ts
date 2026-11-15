import { signInWithPopup, signOut, User } from 'firebase/auth';
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
  db,
  googleAuthProvider,
  handleFirestoreError,
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

export function mapFirebaseAuthError(err: unknown): AuthErrorGuidance {
  const errorObj = err as { code?: string; message?: string };
  const code = errorObj?.code || 'unknown';

  switch (code) {
    case 'auth/popup-closed-by-user':
      return {
        code,
        message: 'Google sign-in popup was closed before completing authentication. Please try again.',
      };
    case 'auth/popup-blocked':
      return {
        code,
        message: 'Your browser blocked the Google sign-in popup. Please allow popups for this site and retry.',
      };
    case 'auth/cancelled-popup-request':
      return {
        code,
        message: 'Previous Google sign-in attempt was cancelled. Please click Continue with Google once.',
      };
    case 'auth/account-exists-with-different-credential':
      return {
        code,
        message: 'An account already exists with this email under different sign-in credentials.',
      };
    case 'auth/operation-not-allowed':
      return {
        code,
        message: 'Google Sign-In is not enabled in Firebase Authentication settings.',
        needsConsoleConfig: true,
      };
    case 'auth/unauthorized-domain':
      return {
        code,
        message: 'This domain is not yet listed under Firebase Authentication Authorized Domains.',
        needsConsoleConfig: true,
      };
    case 'auth/network-request-failed':
      return {
        code,
        message: 'Network error while contacting Google / Firebase Authentication. Check your connection and retry.',
      };
    case 'auth/user-disabled':
      return {
        code,
        message: 'This Google account has been disabled. Please contact support.',
      };
    default:
      return {
        code,
        message: errorObj?.message || 'Google authentication failed. Please try again.',
      };
  }
}

export async function signInWithGoogle(): Promise<User> {
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

/**
 * Checks Firestore for an existing profile; if none exists, creates the initial profile
 * permanently bound to the user's selected role. Never alters an existing user's role.
 */
export async function ensureInitialProfileForNewUser(
  user: User,
  selectedRole: UserRole
): Promise<FullUserAccount> {
  const existing = await fetchUserAccount(user.uid);
  if (existing) {
    return existing;
  }

  const rawName = (user.displayName || user.email?.split('@')[0] || 'VYRO Merchant').trim();
  const fullName = (rawName.length >= 2 ? rawName : 'VYRO Merchant').slice(0, 120);
  const email = (user.email || '').trim().slice(0, 160);
  if (email.length < 3) {
    throw new Error('Your Google account did not return a verified email address.');
  }

  const profileRef = doc(db, 'profiles', user.uid);
  const newProfile: ProfileRecord = {
    uid: user.uid,
    role: selectedRole,
    fullName,
    email,
    ...(user.photoURL && user.photoURL.length <= 500000 ? { photoUrl: user.photoURL } : {}),
    onboardingCompleted: false,
    onboardingStep: 1,
    accountStatus: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(profileRef, newProfile);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, profileRef.path);
  }

  const created = await fetchUserAccount(user.uid);
  if (!created) {
    throw new Error('Could not initialize your VYRO profile in Firestore.');
  }
  return created;
}

export async function saveStep1Personal(
  user: User,
  role: UserRole,
  draft: OnboardingDraft,
  existingProfile: ProfileRecord | null
): Promise<ProfileRecord> {
  const uid = user.uid;
  const profileRef = doc(db, 'profiles', uid);
  const nextStep = existingProfile ? Math.max(existingProfile.onboardingStep, 2) : 2;
  const normalizedEmail = (draft.email.trim() || user.email || '').slice(0, 160);

  if (!existingProfile) {
    const newProfile: ProfileRecord = {
      uid,
      role,
      fullName: draft.fullName.trim().slice(0, 120),
      email: normalizedEmail,
      ...(draft.photoUrl ? { photoUrl: draft.photoUrl } : {}),
      ...(draft.dateOfBirth ? { dateOfBirth: draft.dateOfBirth } : {}),
      ...(draft.gender ? { gender: draft.gender } : {}),
      onboardingCompleted: false,
      onboardingStep: 2,
      accountStatus: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    try {
      await setDoc(profileRef, newProfile);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, profileRef.path);
    }
    return newProfile;
  }

  const updates: {
    fullName: string;
    email: string;
    photoUrl: string;
    dateOfBirth: string;
    gender: ProfileRecord['gender'];
    onboardingStep: number;
    updatedAt: ReturnType<typeof serverTimestamp>;
  } = {
    fullName: draft.fullName.trim().slice(0, 120),
    email: normalizedEmail,
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
    email: draft.email || user.email,
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
      smsOrderAlerts: false,
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
 * Shared post-Google-Sign-In verification:
 * 1. Verifies Firebase ID token with VYRO backend (/api/auth/verify-session)
 * 2. Loads existing user profile & registration status from Firestore
 */
export async function resolveAuthenticatedAccount(
  user: User
): Promise<FullUserAccount | null> {
  await verifySessionWithBackend(user);
  return fetchUserAccount(user.uid);
}
