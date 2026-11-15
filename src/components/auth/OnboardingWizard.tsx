import React, { useState } from 'react';
import { User } from 'firebase/auth';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Camera,
  Check,
  CheckCircle2,
  Edit3,
  FileCheck2,
  Loader2,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  Store,
  User as UserIcon,
} from 'lucide-react';
import { UserRole } from '../../types';
import {
  B2B_BUSINESS_CATEGORIES,
  INDIAN_STATES_AND_UTS,
  RETAILER_SHOP_TYPES,
  WHOLESALER_BUSINESS_TYPES,
  compressImageToDataUrl,
  maskPan,
  validateGstin,
  validateIfsc,
  validatePan,
  validatePincode,
} from '../../data/indianAddressData';
import { FullUserAccount, OnboardingDraft } from '../../types/onboarding';
import {
  completeStep5Registration,
  saveStep1Personal,
  saveStep2Business,
  saveStep3Address,
  saveStep4Verification,
} from '../../services/authService';
import { IndianAddressFields, AddressFieldGroup } from './IndianAddressFields';
import { VyroLogo } from '../VyroLogo';

interface OnboardingWizardProps {
  firebaseUser: User;
  role: UserRole;
  existingAccount: FullUserAccount | null;
  onCompleted: (account: FullUserAccount) => void;
  onSignOut: () => Promise<void>;
}

const STEPS = [
  { id: 1, label: 'Personal Profile', icon: UserIcon },
  { id: 2, label: 'Business Profile', icon: Building2 },
  { id: 3, label: 'Addresses', icon: MapPin },
  { id: 4, label: 'Tax & KYC', icon: FileCheck2 },
  { id: 5, label: 'Review & Submit', icon: CheckCircle2 },
];

function buildInitialDraft(
  firebaseUser: User,
  role: UserRole,
  existing: FullUserAccount | null
): OnboardingDraft {
  const defaultState = 'Karnataka';
  const defaultDistrict = 'Bengaluru Urban';

  return {
    fullName: existing?.profile.fullName || firebaseUser.displayName || '',
    email: existing?.profile.email || firebaseUser.email || '',
    photoUrl: existing?.profile.photoUrl || firebaseUser.photoURL || '',
    dateOfBirth: existing?.profile.dateOfBirth || '',
    gender: existing?.profile.gender || '',

    businessName: existing?.business?.businessName || '',
    businessType:
      existing?.business?.businessType ||
      (role === 'wholesaler' ? WHOLESALER_BUSINESS_TYPES[0] : RETAILER_SHOP_TYPES[0]),
    businessCategory: existing?.business?.businessCategory || B2B_BUSINESS_CATEGORIES[0],
    gstin: existing?.business?.gstin || '',
    registrationNumber: existing?.business?.registrationNumber || '',
    apmcLicense: existing?.business?.apmcLicense || '',
    logoUrl: existing?.business?.logoUrl || '',
    facilityPhotoUrl: existing?.business?.facilityPhotoUrl || '',
    includeBankDetails: Boolean(existing?.business?.bankIfsc || existing?.business?.bankAccountLast4),
    bankAccountHolder: existing?.business?.bankAccountHolder || '',
    bankAccountNumber: '',
    bankAccountLast4: existing?.business?.bankAccountLast4 || '',
    bankIfsc: existing?.business?.bankIfsc || '',

    residentialCountry: existing?.address?.residentialCountry || 'India',
    residentialState: existing?.address?.residentialState || defaultState,
    residentialDistrict: existing?.address?.residentialDistrict || defaultDistrict,
    residentialCity: existing?.address?.residentialCity || '',
    residentialLocality: existing?.address?.residentialLocality || '',
    residentialStreet: existing?.address?.residentialStreet || '',
    residentialPincode: existing?.address?.residentialPincode || '',

    businessSameAsResidential: existing?.address?.businessSameAsResidential ?? false,
    businessCountry: existing?.address?.businessCountry || 'India',
    businessState: existing?.address?.businessState || defaultState,
    businessDistrict: existing?.address?.businessDistrict || defaultDistrict,
    businessCity: existing?.address?.businessCity || '',
    businessLocality: existing?.address?.businessLocality || '',
    businessStreet: existing?.address?.businessStreet || '',
    businessPincode: existing?.address?.businessPincode || '',

    warehouseSameAsBusiness: existing?.address?.warehouseSameAsBusiness ?? true,
    warehouseStreet: existing?.address?.warehouseStreet || '',
    warehouseCity: existing?.address?.warehouseCity || '',
    warehouseState: existing?.address?.warehouseState || defaultState,
    warehousePincode: existing?.address?.warehousePincode || '',

    panInput: '',
    panMasked: existing?.verification?.panMasked || '',
    panHash: existing?.verification?.panHash || '',
    panPurposeConsent: existing?.verification?.panPurposeConsent ?? false,
    aadhaarMethod: existing?.verification?.aadhaarMethod || 'none',
    aadhaarConsent: existing?.verification?.aadhaarConsent ?? false,
  };
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  firebaseUser,
  role,
  existingAccount,
  onCompleted,
  onSignOut,
}) => {
  const initialStep = existingAccount?.profile.onboardingStep
    ? Math.min(Math.max(existingAccount.profile.onboardingStep, 1), 5)
    : 1;

  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const [accountSnapshot, setAccountSnapshot] = useState<FullUserAccount | null>(existingAccount);
  const [draft, setDraft] = useState<OnboardingDraft>(() =>
    buildInitialDraft(firebaseUser, role, existingAccount)
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isCompletedView, setIsCompletedView] = useState<boolean>(false);

  const handlePhotoUpload = async (
    file: File | undefined,
    targetField: 'photoUrl' | 'logoUrl' | 'facilityPhotoUrl'
  ) => {
    if (!file) return;
    setGlobalError(null);
    try {
      const dataUrl = await compressImageToDataUrl(file);
      setDraft((prev) => ({ ...prev, [targetField]: dataUrl }));
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : 'Could not process image.');
    }
  };

  // Step 1 Validation & Save
  const handleSaveStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);
    const errors: Record<string, string> = {};

    if (draft.fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters.';
    }
    const emailTrim = draft.email.trim();
    if (!emailTrim || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
      errors.email = 'Enter a valid business or personal email address.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsSaving(true);
    try {
      const savedProfile = await saveStep1Personal(
        firebaseUser,
        role,
        draft,
        accountSnapshot?.profile || null
      );
      setAccountSnapshot((prev) => ({
        profile: savedProfile,
        business: prev?.business || null,
        address: prev?.address || null,
        verification: prev?.verification || null,
        preferences: prev?.preferences || null,
      }));
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : 'Failed to save personal details.');
    } finally {
      setIsSaving(false);
    }
  };

  // Step 2 Validation & Save
  const handleSaveStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);
    const errors: Record<string, string> = {};

    if (draft.businessName.trim().length < 2) {
      errors.businessName =
        role === 'wholesaler'
          ? 'Enter your distribution / wholesale firm name.'
          : 'Enter your shop / store name.';
    }
    if (!draft.businessType.trim()) {
      errors.businessType = 'Select a business type.';
    }
    if (!draft.businessCategory.trim()) {
      errors.businessCategory = 'Select a primary product category.';
    }
    if (draft.gstin.trim() && !validateGstin(draft.gstin)) {
      errors.gstin = 'GSTIN must be a valid 15-character GST number (e.g. 29ABCDE1234F1Z5).';
    }
    if (draft.includeBankDetails) {
      if (draft.bankAccountHolder.trim().length < 2) {
        errors.bankAccountHolder = 'Enter account holder name.';
      }
      if (
        !draft.bankAccountLast4 &&
        draft.bankAccountNumber.replace(/\D/g, '').length < 6
      ) {
        errors.bankAccountNumber = 'Enter a valid bank account number (only last 4 digits are saved).';
      }
      if (!validateIfsc(draft.bankIfsc)) {
        errors.bankIfsc = 'Enter a valid 11-character IFSC code (e.g. SBIN0001234).';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsSaving(true);
    try {
      const savedBiz = await saveStep2Business(
        firebaseUser,
        role,
        draft,
        accountSnapshot?.business || null,
        true
      );
      setAccountSnapshot((prev) =>
        prev
          ? {
              ...prev,
              profile: { ...prev.profile, onboardingStep: Math.max(prev.profile.onboardingStep, 3) },
              business: savedBiz,
            }
          : null
      );
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : 'Failed to save business details.');
    } finally {
      setIsSaving(false);
    }
  };

  // Step 3 Validation & Save
  const handleSaveStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);
    const errors: Record<string, string> = {};

    if (!draft.residentialState) errors.res_state = 'Select state or UT.';
    if (!draft.residentialDistrict.trim()) errors.res_district = 'Select district.';
    if (draft.residentialCity.trim().length < 2) errors.res_city = 'Enter city or town.';
    if (draft.residentialLocality.trim().length < 1) errors.res_locality = 'Enter locality / area.';
    if (draft.residentialStreet.trim().length < 2) errors.res_street = 'Enter street / building address.';
    if (!validatePincode(draft.residentialPincode)) {
      errors.res_pincode = 'Enter a valid 6-digit Indian PIN code.';
    }

    if (!draft.businessSameAsResidential) {
      if (!draft.businessState) errors.biz_state = 'Select state or UT.';
      if (!draft.businessDistrict.trim()) errors.biz_district = 'Select district.';
      if (draft.businessCity.trim().length < 2) errors.biz_city = 'Enter city or town.';
      if (draft.businessLocality.trim().length < 1) errors.biz_locality = 'Enter locality / area.';
      if (draft.businessStreet.trim().length < 2) errors.biz_street = 'Enter shop / office street address.';
      if (!validatePincode(draft.businessPincode)) {
        errors.biz_pincode = 'Enter a valid 6-digit Indian PIN code.';
      }
    }

    if (role === 'wholesaler' && !draft.warehouseSameAsBusiness) {
      if (draft.warehouseStreet.trim().length < 2) errors.wh_street = 'Enter warehouse address.';
      if (draft.warehouseCity.trim().length < 2) errors.wh_city = 'Enter warehouse city.';
      if (!draft.warehouseState.trim()) errors.wh_state = 'Select warehouse state.';
      if (!validatePincode(draft.warehousePincode)) {
        errors.wh_pincode = 'Enter a valid 6-digit warehouse PIN code.';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsSaving(true);
    try {
      const savedAddr = await saveStep3Address(
        firebaseUser,
        role,
        draft,
        accountSnapshot?.address || null,
        true
      );
      setAccountSnapshot((prev) =>
        prev
          ? {
              ...prev,
              profile: { ...prev.profile, onboardingStep: Math.max(prev.profile.onboardingStep, 4) },
              address: savedAddr,
            }
          : null
      );
      setCurrentStep(4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : 'Failed to save addresses.');
    } finally {
      setIsSaving(false);
    }
  };

  // Step 4 Validation & Save
  const handleSaveStep4 = async (skipOptional = false) => {
    setGlobalError(null);
    const errors: Record<string, string> = {};

    const effectiveDraft = skipOptional
      ? {
          ...draft,
          panInput: '',
          panMasked: '',
          panHash: '',
          panPurposeConsent: false,
          aadhaarMethod: 'none' as const,
          aadhaarConsent: false,
        }
      : draft;

    if (!skipOptional) {
      if (effectiveDraft.panInput.trim()) {
        if (!validatePan(effectiveDraft.panInput)) {
          errors.panInput = 'PAN must follow the format ABCDE1234F (5 letters, 4 digits, 1 letter).';
        }
        if (!effectiveDraft.panPurposeConsent) {
          errors.panPurposeConsent = 'Please confirm consent for B2B PAN tax verification.';
        }
      }
      if (effectiveDraft.aadhaarMethod !== 'none' && !effectiveDraft.aadhaarConsent) {
        errors.aadhaarConsent = 'Please confirm explicit consent for your selected Aadhaar KYC method.';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsSaving(true);
    try {
      const savedVerif = await saveStep4Verification(
        firebaseUser,
        effectiveDraft,
        accountSnapshot?.verification || null,
        true
      );
      setDraft({
        ...effectiveDraft,
        panInput: '',
        panMasked: savedVerif.panMasked || '',
        panHash: savedVerif.panHash || '',
      });
      setAccountSnapshot((prev) =>
        prev
          ? {
              ...prev,
              profile: { ...prev.profile, onboardingStep: Math.max(prev.profile.onboardingStep, 5) },
              verification: savedVerif,
            }
          : null
      );
      setCurrentStep(5);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : 'Failed to save verification details.');
    } finally {
      setIsSaving(false);
    }
  };

  // Step 5 Final Submission
  const handleFinalSubmit = async () => {
    setGlobalError(null);
    setIsSaving(true);
    try {
      const completedAccount = await completeStep5Registration(firebaseUser, role, draft);
      setIsCompletedView(true);
      window.setTimeout(() => {
        onCompleted(completedAccount);
      }, 1100);
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : 'Failed to complete registration.');
    } finally {
      setIsSaving(false);
    }
  };

  const residentialAddressValue: AddressFieldGroup = {
    country: draft.residentialCountry,
    state: draft.residentialState,
    district: draft.residentialDistrict,
    city: draft.residentialCity,
    locality: draft.residentialLocality,
    street: draft.residentialStreet,
    pincode: draft.residentialPincode,
  };

  const businessAddressValue: AddressFieldGroup = {
    country: draft.businessCountry,
    state: draft.businessState,
    district: draft.businessDistrict,
    city: draft.businessCity,
    locality: draft.businessLocality,
    street: draft.businessStreet,
    pincode: draft.businessPincode,
  };

  if (isCompletedView) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-['Plus_Jakarta_Sans',sans-serif]">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#102A56]">Registration Complete</h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Welcome to VYRO, <strong>{draft.businessName}</strong>. Opening your{' '}
            <strong className="capitalize">{role}</strong> dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <VyroLogo size="xs" showTagline={false} />
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
              · Business Onboarding (<span className="capitalize text-[#102A56]">{role}</span>)
            </span>
          </div>

          <button
            type="button"
            onClick={() => void onSignOut()}
            className="text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Progress Stepper */}
        <nav aria-label="Onboarding steps" className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5">
          <div className="grid grid-cols-5 gap-2">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              return (
                <div key={step.id} className="flex flex-col items-center text-center gap-1.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-colors ${
                      isCompleted
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-[#1769E0] text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span
                    className={`text-[11px] font-semibold leading-tight hidden sm:block ${
                      isCurrent ? 'text-[#102A56]' : isCompleted ? 'text-emerald-700' : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </nav>

        {globalError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">{globalError}</span>
          </div>
        )}

        {/* STEP 1: PERSONAL PROFILE */}
        {currentStep === 1 && (
          <form onSubmit={handleSaveStep1} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
            <div className="space-y-1 border-b border-slate-100 pb-4">
              <p className="text-xs font-semibold text-[#1769E0]">Step 1 of 5 · Personal Profile</p>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#102A56]">
                Owner / Authorized Representative Details
              </h1>
              <p className="text-xs text-slate-600">
                Your verified Google identity and assigned <strong className="capitalize">{role}</strong> role are permanently
                linked to this account.
              </p>
            </div>

            {/* Optional Profile Photo */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                {draft.photoUrl ? (
                  <img
                    src={draft.photoUrl}
                    alt="Owner profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-7 h-7 text-slate-400" />
                )}
              </div>
              <div className="space-y-1.5">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg cursor-pointer transition-colors">
                  <Camera className="w-3.5 h-3.5" />
                  <span>{draft.photoUrl ? 'Change Profile Photo' : 'Upload Profile Photo (Optional)'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => void handlePhotoUpload(e.target.files?.[0], 'photoUrl')}
                  />
                </label>
                <p className="text-[11px] text-slate-400">JPG, PNG or WebP · Max 5 MB</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={draft.fullName}
                  onChange={(e) => setDraft({ ...draft, fullName: e.target.value })}
                  placeholder="e.g. Ramesh Shetty"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1769E0]"
                />
                {fieldErrors.fullName && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.fullName}</p>}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Verified Google Email <span className="text-red-600">*</span>
                </label>
                {firebaseUser.email ? (
                  <div className="px-3.5 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl font-semibold text-emerald-800 flex items-center justify-between gap-2">
                    <span className="truncate">{firebaseUser.email}</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  </div>
                ) : (
                  <input
                    type="email"
                    value={draft.email}
                    onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                    placeholder="name@business.in"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1769E0]"
                  />
                )}
                {fieldErrors.email && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.email}</p>}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Date of Birth <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="date"
                  value={draft.dateOfBirth}
                  onChange={(e) => setDraft({ ...draft, dateOfBirth: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1769E0]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Gender <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <select
                  value={draft.gender}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      gender: e.target.value as OnboardingDraft['gender'],
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1769E0]"
                >
                  <option value="">Prefer not to specify</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Account Role</label>
                <div className="px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl font-bold text-[#102A56] capitalize flex items-center gap-2">
                  {role === 'wholesaler' ? (
                    <Building2 className="w-4 h-4 text-[#0EA5A4]" />
                  ) : (
                    <Store className="w-4 h-4 text-[#1769E0]" />
                  )}
                  <span>{role} (Permanent)</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 bg-[#1769E0] hover:bg-[#102A56] disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>Save &amp; Continue to Business Profile</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: BUSINESS PROFILE (Tailored by Wholesaler vs Retailer) */}
        {currentStep === 2 && (
          <form onSubmit={handleSaveStep2} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
            <div className="space-y-1 border-b border-slate-100 pb-4">
              <p className="text-xs font-semibold text-[#1769E0]">
                Step 2 of 5 · {role === 'wholesaler' ? 'Wholesaler Firm Setup' : 'Retailer Store Setup'}
              </p>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#102A56]">
                {role === 'wholesaler'
                  ? 'Wholesale Distribution Business Profile'
                  : 'Retail Store & Shop Profile'}
              </h1>
              <p className="text-xs text-slate-600">
                {role === 'wholesaler'
                  ? 'Provide your firm details, APMC credentials, and optional settlement bank information.'
                  : 'Provide your shop name, retail format, and optional GST / settlement details.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  {role === 'wholesaler' ? 'Wholesale Firm / Enterprise Name' : 'Shop / Store Name'}{' '}
                  <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={draft.businessName}
                  onChange={(e) => setDraft({ ...draft, businessName: e.target.value })}
                  placeholder={
                    role === 'wholesaler' ? 'e.g. Shree Lakshmi Wholesale Traders' : 'e.g. Ramesh Kirana & General Stores'
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1769E0]"
                />
                {fieldErrors.businessName && (
                  <p className="text-[11px] text-red-600 mt-1">{fieldErrors.businessName}</p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {role === 'wholesaler' ? 'Wholesaler Business Type' : 'Retail Store Format'}{' '}
                  <span className="text-red-600">*</span>
                </label>
                <select
                  value={draft.businessType}
                  onChange={(e) => setDraft({ ...draft, businessType: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1769E0]"
                >
                  {(role === 'wholesaler' ? WHOLESALER_BUSINESS_TYPES : RETAILER_SHOP_TYPES).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                {fieldErrors.businessType && (
                  <p className="text-[11px] text-red-600 mt-1">{fieldErrors.businessType}</p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Primary Trade Category <span className="text-red-600">*</span>
                </label>
                <select
                  value={draft.businessCategory}
                  onChange={(e) => setDraft({ ...draft, businessCategory: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1769E0]"
                >
                  {B2B_BUSINESS_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  GSTIN <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  maxLength={15}
                  value={draft.gstin}
                  onChange={(e) => setDraft({ ...draft, gstin: e.target.value.toUpperCase() })}
                  placeholder="29ABCDE1234F1Z5"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1769E0]"
                />
                {fieldErrors.gstin && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.gstin}</p>}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {role === 'wholesaler' ? 'Company / Udyam Registration No.' : 'Shop & Establishment / Udyam No.'}{' '}
                  <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={draft.registrationNumber}
                  onChange={(e) => setDraft({ ...draft, registrationNumber: e.target.value })}
                  placeholder="e.g. UDYAM-KA-03-0012491"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1769E0]"
                />
              </div>

              {role === 'wholesaler' && (
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    APMC Mandi License Number <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={draft.apmcLicense}
                    onChange={(e) => setDraft({ ...draft, apmcLicense: e.target.value })}
                    placeholder="e.g. APMC-YPR-2024-8841"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1769E0]"
                  />
                </div>
              )}
            </div>

            {/* Business Logo & Shopfront / Warehouse Photos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-xs">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                <span className="font-bold text-[#102A56] block">Business Logo (Optional)</span>
                <div className="flex items-center gap-3">
                  {draft.logoUrl && (
                    <img src={draft.logoUrl} alt="Business logo" className="w-12 h-12 rounded-lg object-cover border" />
                  )}
                  <label className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg font-semibold text-slate-700 cursor-pointer">
                    <span>{draft.logoUrl ? 'Replace Logo' : 'Upload Logo'}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => void handlePhotoUpload(e.target.files?.[0], 'logoUrl')}
                    />
                  </label>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                <span className="font-bold text-[#102A56] block">
                  {role === 'wholesaler' ? 'Warehouse Photo (Optional)' : 'Shopfront Photo (Optional)'}
                </span>
                <div className="flex items-center gap-3">
                  {draft.facilityPhotoUrl && (
                    <img
                      src={draft.facilityPhotoUrl}
                      alt="Business facility"
                      className="w-12 h-12 rounded-lg object-cover border"
                    />
                  )}
                  <label className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg font-semibold text-slate-700 cursor-pointer">
                    <span>{draft.facilityPhotoUrl ? 'Replace Photo' : 'Upload Photo'}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => void handlePhotoUpload(e.target.files?.[0], 'facilityPhotoUrl')}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Optional Bank Settlement Details */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold text-[#102A56] cursor-pointer">
                <input
                  type="checkbox"
                  checked={draft.includeBankDetails}
                  onChange={(e) => setDraft({ ...draft, includeBankDetails: e.target.checked })}
                  className="rounded border-slate-300 text-[#1769E0] focus:ring-[#1769E0]"
                />
                <span>Add Bank Settlement Account (Optional — only masked last 4 digits are saved)</span>
              </label>

              {draft.includeBankDetails && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Account Holder Name</label>
                    <input
                      type="text"
                      value={draft.bankAccountHolder}
                      onChange={(e) => setDraft({ ...draft, bankAccountHolder: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg"
                    />
                    {fieldErrors.bankAccountHolder && (
                      <p className="text-[11px] text-red-600 mt-1">{fieldErrors.bankAccountHolder}</p>
                    )}
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Account Number {draft.bankAccountLast4 ? `(Saved ••••${draft.bankAccountLast4})` : ''}
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      value={draft.bankAccountNumber}
                      onChange={(e) =>
                        setDraft({ ...draft, bankAccountNumber: e.target.value.replace(/\D/g, '') })
                      }
                      placeholder={draft.bankAccountLast4 ? `••••${draft.bankAccountLast4}` : 'Enter account number'}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono"
                    />
                    {fieldErrors.bankAccountNumber && (
                      <p className="text-[11px] text-red-600 mt-1">{fieldErrors.bankAccountNumber}</p>
                    )}
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">IFSC Code</label>
                    <input
                      type="text"
                      maxLength={11}
                      value={draft.bankIfsc}
                      onChange={(e) => setDraft({ ...draft, bankIfsc: e.target.value.toUpperCase() })}
                      placeholder="SBIN0001234"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono uppercase"
                    />
                    {fieldErrors.bankIfsc && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.bankIfsc}</p>}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 bg-[#1769E0] hover:bg-[#102A56] disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Save &amp; Continue to Addresses</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: INDIAN ADDRESSES */}
        {currentStep === 3 && (
          <form onSubmit={handleSaveStep3} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-8">
            <div className="space-y-1 border-b border-slate-100 pb-4">
              <p className="text-xs font-semibold text-[#1769E0]">Step 3 of 5 · Location &amp; Dispatch Addresses</p>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#102A56]">
                Residential &amp; {role === 'wholesaler' ? 'Warehouse / Office' : 'Shop'} Addresses
              </h1>
              <p className="text-xs text-slate-600">
                All Indian States &amp; Union Territories supported with 6-digit PIN code validation.
              </p>
            </div>

            <IndianAddressFields
              title="1. Residential Address (Proprietor / Manager)"
              value={residentialAddressValue}
              onChange={(updated) =>
                setDraft((prev) => ({
                  ...prev,
                  residentialCountry: updated.country,
                  residentialState: updated.state,
                  residentialDistrict: updated.district,
                  residentialCity: updated.city,
                  residentialLocality: updated.locality,
                  residentialStreet: updated.street,
                  residentialPincode: updated.pincode,
                }))
              }
              errors={{
                state: fieldErrors.res_state,
                district: fieldErrors.res_district,
                city: fieldErrors.res_city,
                locality: fieldErrors.res_locality,
                street: fieldErrors.res_street,
                pincode: fieldErrors.res_pincode,
              }}
            />

            <div className="pt-4 border-t border-slate-200 space-y-4">
              <label className="inline-flex items-center gap-2.5 text-xs font-bold text-[#102A56] cursor-pointer">
                <input
                  type="checkbox"
                  checked={draft.businessSameAsResidential}
                  onChange={(e) => setDraft({ ...draft, businessSameAsResidential: e.target.checked })}
                  className="rounded border-slate-300 text-[#1769E0] focus:ring-[#1769E0]"
                />
                <span>Business / Shop address is same as residential address</span>
              </label>

              {!draft.businessSameAsResidential && (
                <IndianAddressFields
                  title={role === 'wholesaler' ? '2. Registered Office Address' : '2. Shop / Store Delivery Address'}
                  value={businessAddressValue}
                  onChange={(updated) =>
                    setDraft((prev) => ({
                      ...prev,
                      businessCountry: updated.country,
                      businessState: updated.state,
                      businessDistrict: updated.district,
                      businessCity: updated.city,
                      businessLocality: updated.locality,
                      businessStreet: updated.street,
                      businessPincode: updated.pincode,
                    }))
                  }
                  errors={{
                    state: fieldErrors.biz_state,
                    district: fieldErrors.biz_district,
                    city: fieldErrors.biz_city,
                    locality: fieldErrors.biz_locality,
                    street: fieldErrors.biz_street,
                    pincode: fieldErrors.biz_pincode,
                  }}
                />
              )}
            </div>

            {role === 'wholesaler' && (
              <div className="pt-4 border-t border-slate-200 space-y-4">
                <label className="inline-flex items-center gap-2.5 text-xs font-bold text-[#102A56] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draft.warehouseSameAsBusiness}
                    onChange={(e) => setDraft({ ...draft, warehouseSameAsBusiness: e.target.checked })}
                    className="rounded border-slate-300 text-[#0EA5A4] focus:ring-[#0EA5A4]"
                  />
                  <span>Warehouse / Dispatch Hub address is same as business address</span>
                </label>

                {!draft.warehouseSameAsBusiness && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">Warehouse Street / Terminal *</label>
                      <input
                        type="text"
                        value={draft.warehouseStreet}
                        onChange={(e) => setDraft({ ...draft, warehouseStreet: e.target.value })}
                        placeholder="e.g. Plot 42, APMC Yard Phase 2"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg"
                      />
                      {fieldErrors.wh_street && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.wh_street}</p>}
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Warehouse City *</label>
                      <input
                        type="text"
                        value={draft.warehouseCity}
                        onChange={(e) => setDraft({ ...draft, warehouseCity: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg"
                      />
                      {fieldErrors.wh_city && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.wh_city}</p>}
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Warehouse State / UT *</label>
                      <select
                        value={draft.warehouseState}
                        onChange={(e) => setDraft({ ...draft, warehouseState: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg"
                      >
                        {INDIAN_STATES_AND_UTS.map((s) => (
                          <option key={s.name} value={s.name}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Warehouse PIN Code *</label>
                      <input
                        type="text"
                        maxLength={6}
                        inputMode="numeric"
                        value={draft.warehousePincode}
                        onChange={(e) => setDraft({ ...draft, warehousePincode: e.target.value.replace(/\D/g, '') })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono tabular-nums"
                      />
                      {fieldErrors.wh_pincode && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.wh_pincode}</p>}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 bg-[#1769E0] hover:bg-[#102A56] disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Save &amp; Continue to Tax &amp; KYC</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: TAX & VERIFICATION (PAN + OPTIONAL AUTHORIZED AADHAAR CONSENT) */}
        {currentStep === 4 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
            <div className="space-y-1 border-b border-slate-100 pb-4">
              <p className="text-xs font-semibold text-[#1769E0]">Step 4 of 5 · Tax &amp; Identity Verification</p>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#102A56]">
                PAN &amp; Optional Authorized KYC
              </h1>
              <p className="text-xs text-slate-600 leading-relaxed">
                Why we request this: PAN enables GST-compliant B2B invoicing and verified supplier/buyer trust badges.
                Your PAN is encrypted and hashed on the VYRO server—only a masked value (e.g.{' '}
                <code className="font-mono">AB******4F</code>) is stored in your profile.
              </p>
            </div>

            {/* PAN Section */}
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#102A56]">Business or Proprietor PAN (Optional)</h2>
                {draft.panMasked && (
                  <span className="font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                    Saved: {draft.panMasked}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">10-Character PAN</label>
                  <input
                    type="text"
                    maxLength={10}
                    value={draft.panInput}
                    onChange={(e) => setDraft({ ...draft, panInput: e.target.value.toUpperCase() })}
                    placeholder={draft.panMasked ? 'Enter new PAN to replace' : 'ABCDE1234F'}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-mono uppercase font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1769E0]"
                  />
                  {fieldErrors.panInput && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.panInput}</p>}
                  {draft.panInput.trim().length === 10 && validatePan(draft.panInput) && (
                    <p className="text-[11px] text-emerald-700 mt-1 font-medium">
                      Will be masked as {maskPan(draft.panInput)} before saving.
                    </p>
                  )}
                </div>

                <div className="flex items-end">
                  <label className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer pb-2">
                    <input
                      type="checkbox"
                      checked={draft.panPurposeConsent}
                      onChange={(e) => setDraft({ ...draft, panPurposeConsent: e.target.checked })}
                      className="mt-0.5 rounded border-slate-300 text-[#1769E0]"
                    />
                    <span>
                      I consent to VYRO validating and hashing my PAN strictly for B2B tax compliance and invoice
                      generation.
                    </span>
                  </label>
                </div>
              </div>
              {fieldErrors.panPurposeConsent && (
                <p className="text-[11px] text-red-600">{fieldErrors.panPurposeConsent}</p>
              )}
            </div>

            {/* Privacy-First Optional Aadhaar Consent Section */}
            <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-4 text-xs">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-sm font-bold text-[#102A56]">
                    Aadhaar Verification (Optional — Not Compulsory)
                  </h2>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">
                    VYRO never collects, transmits, or stores raw 12-digit Aadhaar numbers. If you choose optional KYC,
                    only authorized consent methods (DigiLocker or UIDAI Offline e-KYC XML) are recorded.
                  </p>
                </div>
                <ShieldCheck className="w-5 h-5 text-[#0EA5A4] shrink-0" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    value: 'none' as const,
                    title: 'Skip for Now',
                    desc: 'Complete onboarding without Aadhaar KYC.',
                  },
                  {
                    value: 'digilocker_consent' as const,
                    title: 'DigiLocker Consent',
                    desc: 'Queue authorized DigiLocker verification.',
                  },
                  {
                    value: 'offline_xml_consent' as const,
                    title: 'Offline e-KYC XML',
                    desc: 'Use UIDAI paperless offline XML token.',
                  },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      setDraft({
                        ...draft,
                        aadhaarMethod: opt.value,
                        aadhaarConsent: opt.value === 'none' ? false : draft.aadhaarConsent,
                      })
                    }
                    className={`p-3.5 rounded-xl border text-left transition-colors cursor-pointer ${
                      draft.aadhaarMethod === opt.value
                        ? 'border-[#1769E0] bg-blue-50/50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <p className="font-bold text-[#102A56]">{opt.title}</p>
                    <p className="text-[11px] text-slate-500 mt-1">{opt.desc}</p>
                  </button>
                ))}
              </div>

              {draft.aadhaarMethod !== 'none' && (
                <div className="space-y-1">
                  <label className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={draft.aadhaarConsent}
                      onChange={(e) => setDraft({ ...draft, aadhaarConsent: e.target.checked })}
                      className="mt-0.5 rounded border-slate-300 text-[#1769E0]"
                    />
                    <span>
                      I voluntarily authorize VYRO to mark my account ready for{' '}
                      <strong>
                        {draft.aadhaarMethod === 'digilocker_consent' ? 'DigiLocker' : 'UIDAI Offline XML'}
                      </strong>{' '}
                      consent-based KYC verification.
                    </span>
                  </label>
                  {fieldErrors.aadhaarConsent && (
                    <p className="text-[11px] text-red-600">{fieldErrors.aadhaarConsent}</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => void handleSaveStep4(true)}
                  className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Skip Optional Verification
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => void handleSaveStep4(false)}
                  className="px-6 py-3 bg-[#1769E0] hover:bg-[#102A56] disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save &amp; Review Submission</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: REVIEW & SUBMIT */}
        {currentStep === 5 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
            <div className="space-y-1 border-b border-slate-100 pb-4">
              <p className="text-xs font-semibold text-[#1769E0]">Step 5 of 5 · Review &amp; Submit</p>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#102A56]">
                Review Your Business Registration
              </h1>
              <p className="text-xs text-slate-600">
                Verify your profile, business credentials, and addresses before opening your VYRO dashboard.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Personal Summary */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-[#102A56]">Personal Profile</span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-[#1769E0] font-semibold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                </div>
                <p>
                  <span className="text-slate-500">Full Name:</span>{' '}
                  <strong className="text-slate-900">{draft.fullName}</strong>
                </p>
                <p>
                  <span className="text-slate-500">Google Email:</span>{' '}
                  <strong className="text-slate-900">{draft.email}</strong>
                </p>
                <p>
                  <span className="text-slate-500">Permanent Role:</span>{' '}
                  <strong className="capitalize text-[#1769E0]">{role}</strong>
                </p>
              </div>

              {/* Business Summary */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-[#102A56]">Business Profile</span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="text-[#1769E0] font-semibold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                </div>
                <p>
                  <span className="text-slate-500">Business Name:</span>{' '}
                  <strong className="text-slate-900">{draft.businessName}</strong>
                </p>
                <p>
                  <span className="text-slate-500">Format:</span>{' '}
                  <strong className="text-slate-900">{draft.businessType}</strong>
                </p>
                <p>
                  <span className="text-slate-500">Category:</span>{' '}
                  <strong className="text-slate-900">{draft.businessCategory}</strong>
                </p>
                <p>
                  <span className="text-slate-500">GSTIN:</span>{' '}
                  <strong className="font-mono text-slate-900">{draft.gstin || 'Not provided'}</strong>
                </p>
              </div>

              {/* Address Summary */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-[#102A56]">Addresses</span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="text-[#1769E0] font-semibold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                </div>
                <p>
                  <span className="text-slate-500 block">Residential:</span>
                  <strong className="text-slate-900">
                    {draft.residentialStreet}, {draft.residentialLocality}, {draft.residentialCity},{' '}
                    {draft.residentialDistrict}, {draft.residentialState} - {draft.residentialPincode}
                  </strong>
                </p>
                <p>
                  <span className="text-slate-500 block">
                    {role === 'wholesaler' ? 'Business Office:' : 'Shop Delivery:'}
                  </span>
                  <strong className="text-slate-900">
                    {draft.businessSameAsResidential
                      ? 'Same as residential address'
                      : `${draft.businessStreet}, ${draft.businessLocality}, ${draft.businessCity}, ${draft.businessState} - ${draft.businessPincode}`}
                  </strong>
                </p>
              </div>

              {/* Tax & KYC Summary */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-[#102A56]">Tax &amp; Verification</span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="text-[#1769E0] font-semibold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                </div>
                <p>
                  <span className="text-slate-500">PAN Status:</span>{' '}
                  <strong className="font-mono text-slate-900">
                    {draft.panMasked ? `Verified Format (${draft.panMasked})` : 'Skipped / Optional'}
                  </strong>
                </p>
                <p>
                  <span className="text-slate-500">Aadhaar KYC:</span>{' '}
                  <strong className="text-slate-900">
                    {draft.aadhaarMethod === 'none'
                      ? 'Skipped (Optional)'
                      : draft.aadhaarMethod === 'digilocker_consent'
                      ? 'DigiLocker Consent Recorded'
                      : 'Offline e-KYC XML Consent Recorded'}
                  </strong>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                id="submit-registration-btn"
                disabled={isSaving}
                onClick={() => void handleFinalSubmit()}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Submit Registration &amp; Open Dashboard</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
