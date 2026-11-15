import React, { useState } from 'react';
import { User } from 'firebase/auth';
import {
  Bell,
  Building2,
  Camera,
  CheckCircle2,
  FileCheck2,
  Loader2,
  Lock,
  MapPin,
  Save,
  ShieldAlert,
  Trash2,
  User as UserIcon,
} from 'lucide-react';
import {
  B2B_BUSINESS_CATEGORIES,
  INDIAN_STATES_AND_UTS,
  RETAILER_SHOP_TYPES,
  WHOLESALER_BUSINESS_TYPES,
  compressImageToDataUrl,
  validateGstin,
  validateIfsc,
  validatePan,
  validatePincode,
} from '../../data/indianAddressData';
import {
  fetchUserAccount,
  requestAccountDeletion,
  saveStep1Personal,
  saveStep2Business,
  saveStep3Address,
  saveStep4Verification,
  updateUserPreferences,
} from '../../services/authService';
import { FullUserAccount, OnboardingDraft } from '../../types/onboarding';
import { IndianAddressFields, AddressFieldGroup } from '../auth/IndianAddressFields';

interface ProfileSettingsViewProps {
  firebaseUser: User;
  account: FullUserAccount;
  onAccountUpdated: (updated: FullUserAccount) => void;
  onLogout: () => Promise<void>;
}

type SettingsTab = 'personal' | 'business' | 'addresses' | 'kyc' | 'preferences' | 'security';

export const ProfileSettingsView: React.FC<ProfileSettingsViewProps> = ({
  firebaseUser,
  account,
  onAccountUpdated,
  onLogout,
}) => {
  const role = account.profile.role;
  const [activeTab, setActiveTab] = useState<SettingsTab>('personal');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Editable Draft State synchronized with Firestore Account
  const [draft, setDraft] = useState<OnboardingDraft>(() => ({
    fullName: account.profile.fullName,
    phoneNumber: account.profile.phoneNumber,
    email: account.profile.email,
    photoUrl: account.profile.photoUrl || '',
    dateOfBirth: account.profile.dateOfBirth || '',
    gender: account.profile.gender || '',

    businessName: account.business?.businessName || '',
    businessType:
      account.business?.businessType ||
      (role === 'wholesaler' ? WHOLESALER_BUSINESS_TYPES[0] : RETAILER_SHOP_TYPES[0]),
    businessCategory: account.business?.businessCategory || B2B_BUSINESS_CATEGORIES[0],
    gstin: account.business?.gstin || '',
    registrationNumber: account.business?.registrationNumber || '',
    apmcLicense: account.business?.apmcLicense || '',
    logoUrl: account.business?.logoUrl || '',
    facilityPhotoUrl: account.business?.facilityPhotoUrl || '',
    includeBankDetails: Boolean(account.business?.bankIfsc || account.business?.bankAccountLast4),
    bankAccountHolder: account.business?.bankAccountHolder || '',
    bankAccountNumber: '',
    bankAccountLast4: account.business?.bankAccountLast4 || '',
    bankIfsc: account.business?.bankIfsc || '',

    residentialCountry: account.address?.residentialCountry || 'India',
    residentialState: account.address?.residentialState || 'Karnataka',
    residentialDistrict: account.address?.residentialDistrict || 'Bengaluru Urban',
    residentialCity: account.address?.residentialCity || '',
    residentialLocality: account.address?.residentialLocality || '',
    residentialStreet: account.address?.residentialStreet || '',
    residentialPincode: account.address?.residentialPincode || '',

    businessSameAsResidential: account.address?.businessSameAsResidential ?? false,
    businessCountry: account.address?.businessCountry || 'India',
    businessState: account.address?.businessState || 'Karnataka',
    businessDistrict: account.address?.businessDistrict || 'Bengaluru Urban',
    businessCity: account.address?.businessCity || '',
    businessLocality: account.address?.businessLocality || '',
    businessStreet: account.address?.businessStreet || '',
    businessPincode: account.address?.businessPincode || '',

    warehouseSameAsBusiness: account.address?.warehouseSameAsBusiness ?? true,
    warehouseStreet: account.address?.warehouseStreet || '',
    warehouseCity: account.address?.warehouseCity || '',
    warehouseState: account.address?.warehouseState || 'Karnataka',
    warehousePincode: account.address?.warehousePincode || '',

    panInput: '',
    panMasked: account.verification?.panMasked || '',
    panHash: account.verification?.panHash || '',
    panPurposeConsent: account.verification?.panPurposeConsent ?? false,
    aadhaarMethod: account.verification?.aadhaarMethod || 'none',
    aadhaarConsent: account.verification?.aadhaarConsent ?? false,
  }));

  const [prefs, setPrefs] = useState({
    whatsappAlerts: account.preferences?.whatsappAlerts ?? true,
    smsOrderAlerts: account.preferences?.smsOrderAlerts ?? true,
    emailInvoices: account.preferences?.emailInvoices ?? true,
    lowStockThresholdDefault: account.preferences?.lowStockThresholdDefault ?? 15,
    language: account.preferences?.language || 'English (India)',
  });

  const [deleteReason, setDeleteReason] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const clearAlerts = () => {
    setStatusMessage(null);
    setErrorMessage(null);
  };

  const refreshAccount = async () => {
    const fresh = await fetchUserAccount(firebaseUser.uid);
    if (fresh) {
      onAccountUpdated(fresh);
    }
  };

  const handleImageUpload = async (
    file: File | undefined,
    field: 'photoUrl' | 'logoUrl' | 'facilityPhotoUrl'
  ) => {
    if (!file) return;
    clearAlerts();
    try {
      const dataUrl = await compressImageToDataUrl(file);
      setDraft((prev) => ({ ...prev, [field]: dataUrl }));
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Image upload failed.');
    }
  };

  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    if (draft.fullName.trim().length < 2) {
      setErrorMessage('Full name must be at least 2 characters.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsSaving(true);
    try {
      await saveStep1Personal(firebaseUser, role, draft, account.profile);
      await refreshAccount();
      setStatusMessage('Personal profile saved successfully.');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to update personal profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    if (draft.businessName.trim().length < 2) {
      setErrorMessage('Business name must be at least 2 characters.');
      return;
    }
    if (draft.gstin.trim() && !validateGstin(draft.gstin)) {
      setErrorMessage('Enter a valid 15-character GSTIN or leave it empty.');
      return;
    }
    if (draft.includeBankDetails && draft.bankIfsc.trim() && !validateIfsc(draft.bankIfsc)) {
      setErrorMessage('Enter a valid 11-character bank IFSC code.');
      return;
    }

    setIsSaving(true);
    try {
      await saveStep2Business(firebaseUser, role, draft, account.business, false);
      await refreshAccount();
      setStatusMessage('Business profile & logo updated.');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to update business profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAddresses = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    if (!validatePincode(draft.residentialPincode)) {
      setErrorMessage('Residential PIN code must be a valid 6-digit Indian PIN.');
      return;
    }
    if (!draft.businessSameAsResidential && !validatePincode(draft.businessPincode)) {
      setErrorMessage('Business PIN code must be a valid 6-digit Indian PIN.');
      return;
    }
    if (role === 'wholesaler' && !draft.warehouseSameAsBusiness && !validatePincode(draft.warehousePincode)) {
      setErrorMessage('Warehouse PIN code must be a valid 6-digit Indian PIN.');
      return;
    }

    setIsSaving(true);
    try {
      await saveStep3Address(firebaseUser, role, draft, account.address, false);
      await refreshAccount();
      setStatusMessage('Business and residential addresses saved.');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to update addresses.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveKyc = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    if (draft.panInput.trim()) {
      if (!validatePan(draft.panInput)) {
        setErrorMessage('PAN must follow ABCDE1234F format.');
        return;
      }
      if (!draft.panPurposeConsent) {
        setErrorMessage('Please confirm consent for B2B PAN tax verification.');
        return;
      }
    }
    if (draft.aadhaarMethod !== 'none' && !draft.aadhaarConsent) {
      setErrorMessage('Please confirm consent for the selected Aadhaar verification method.');
      return;
    }

    setIsSaving(true);
    try {
      const saved = await saveStep4Verification(firebaseUser, draft, account.verification, false);
      setDraft((prev) => ({ ...prev, panInput: '', panMasked: saved.panMasked || '' }));
      await refreshAccount();
      setStatusMessage('Tax & verification status updated.');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to update verification details.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    setIsSaving(true);
    try {
      await updateUserPreferences(firebaseUser.uid, {
        ...prefs,
        lowStockThresholdDefault: Math.max(1, Number(prefs.lowStockThresholdDefault) || 15),
      });
      await refreshAccount();
      setStatusMessage('Notification and threshold preferences saved.');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to update preferences.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletionRequest = async () => {
    clearAlerts();
    if (deleteReason.trim().length < 3) {
      setErrorMessage('Please provide a brief reason before requesting account deletion.');
      return;
    }
    setIsSaving(true);
    try {
      await requestAccountDeletion(firebaseUser, deleteReason);
      await refreshAccount();
      setShowDeleteConfirm(false);
      setStatusMessage('Account deletion request recorded. Our compliance team will process it within 7 business days.');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to submit deletion request.');
    } finally {
      setIsSaving(false);
    }
  };

  const residentialValue: AddressFieldGroup = {
    country: draft.residentialCountry,
    state: draft.residentialState,
    district: draft.residentialDistrict,
    city: draft.residentialCity,
    locality: draft.residentialLocality,
    street: draft.residentialStreet,
    pincode: draft.residentialPincode,
  };

  const businessValue: AddressFieldGroup = {
    country: draft.businessCountry,
    state: draft.businessState,
    district: draft.businessDistrict,
    city: draft.businessCity,
    locality: draft.businessLocality,
    street: draft.businessStreet,
    pincode: draft.businessPincode,
  };

  const tabs: { id: SettingsTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'personal', label: 'Personal', icon: UserIcon },
    { id: 'business', label: 'Business', icon: Building2 },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'kyc', label: 'Tax & KYC', icon: FileCheck2 },
    { id: 'preferences', label: 'Preferences', icon: Bell },
    { id: 'security', label: 'Account', icon: Lock },
  ];

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Header Summary Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
            {draft.logoUrl || draft.photoUrl ? (
              <img src={draft.logoUrl || draft.photoUrl} alt="Account avatar" className="w-full h-full object-cover" />
            ) : (
              <Building2 className="w-6 h-6 text-[#1769E0]" />
            )}
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[#102A56]">
              {account.business?.businessName || account.profile.fullName}
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              <span>{account.profile.fullName}</span>
              <span aria-hidden="true"> · </span>
              <span className="capitalize font-semibold text-[#1769E0]">{role} Account</span>
              <span aria-hidden="true"> · </span>
              <span className="font-mono">{account.profile.phoneNumber}</span>
            </p>
          </div>
        </div>

        <div className="text-xs text-right">
          <span className="text-slate-500 block">Verification Status</span>
          <span className="font-bold text-[#102A56] capitalize">
            {(account.verification?.kycStatus || 'unverified').replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl border border-slate-200">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setActiveTab(t.id);
                clearAlerts();
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                active ? 'bg-[#102A56] text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {statusMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 font-semibold flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* TAB 1: PERSONAL */}
      {activeTab === 'personal' && (
        <form onSubmit={handleSavePersonal} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 text-xs">
          <h2 className="text-base font-extrabold text-[#102A56]">Personal Information</h2>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
              {draft.photoUrl ? (
                <img src={draft.photoUrl} alt="Owner" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-6 h-6 text-slate-400" />
              )}
            </div>
            <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold text-slate-800 inline-flex items-center gap-1.5 cursor-pointer">
              <Camera className="w-3.5 h-3.5" />
              <span>Update Profile Photo</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => void handleImageUpload(e.target.files?.[0], 'photoUrl')}
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                value={draft.fullName}
                onChange={(e) => setDraft({ ...draft, fullName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Registered Mobile Number (Locked)</label>
              <input
                type="text"
                disabled
                value={account.profile.phoneNumber}
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl font-mono text-slate-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Account Role (Permanent)</label>
              <input
                type="text"
                disabled
                value={role.toUpperCase()}
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl font-bold text-[#102A56]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date"
                value={draft.dateOfBirth}
                onChange={(e) => setDraft({ ...draft, dateOfBirth: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Gender</label>
              <select
                value={draft.gender}
                onChange={(e) => setDraft({ ...draft, gender: e.target.value as OnboardingDraft['gender'] })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="">Prefer not to specify</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 bg-[#1769E0] hover:bg-[#102A56] text-white font-bold rounded-xl inline-flex items-center gap-2 cursor-pointer"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Personal Profile</span>
          </button>
        </form>
      )}

      {/* TAB 2: BUSINESS */}
      {activeTab === 'business' && (
        <form onSubmit={handleSaveBusiness} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 text-xs">
          <h2 className="text-base font-extrabold text-[#102A56]">Business Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Business / Store Name *</label>
              <input
                type="text"
                value={draft.businessName}
                onChange={(e) => setDraft({ ...draft, businessName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Business Type</label>
              <select
                value={draft.businessType}
                onChange={(e) => setDraft({ ...draft, businessType: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                {(role === 'wholesaler' ? WHOLESALER_BUSINESS_TYPES : RETAILER_SHOP_TYPES).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Primary Category</label>
              <select
                value={draft.businessCategory}
                onChange={(e) => setDraft({ ...draft, businessCategory: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                {B2B_BUSINESS_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">GSTIN</label>
              <input
                type="text"
                maxLength={15}
                value={draft.gstin}
                onChange={(e) => setDraft({ ...draft, gstin: e.target.value.toUpperCase() })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Registration / Udyam No.</label>
              <input
                type="text"
                value={draft.registrationNumber}
                onChange={(e) => setDraft({ ...draft, registrationNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            {role === 'wholesaler' && (
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">APMC License Number</label>
                <input
                  type="text"
                  value={draft.apmcLicense}
                  onChange={(e) => setDraft({ ...draft, apmcLicense: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-3">
              {draft.logoUrl && <img src={draft.logoUrl} alt="Logo" className="w-12 h-12 rounded-lg object-cover border" />}
              <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold cursor-pointer">
                <span>Upload / Change Logo</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => void handleImageUpload(e.target.files?.[0], 'logoUrl')}
                />
              </label>
            </div>
            <div className="flex items-center gap-3">
              {draft.facilityPhotoUrl && (
                <img src={draft.facilityPhotoUrl} alt="Facility" className="w-12 h-12 rounded-lg object-cover border" />
              )}
              <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold cursor-pointer">
                <span>{role === 'wholesaler' ? 'Update Warehouse Photo' : 'Update Shop Photo'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => void handleImageUpload(e.target.files?.[0], 'facilityPhotoUrl')}
                />
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 bg-[#1769E0] hover:bg-[#102A56] text-white font-bold rounded-xl inline-flex items-center gap-2 cursor-pointer"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Business Details</span>
          </button>
        </form>
      )}

      {/* TAB 3: ADDRESSES */}
      {activeTab === 'addresses' && (
        <form onSubmit={handleSaveAddresses} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 text-xs">
          <IndianAddressFields
            title="Residential Address"
            value={residentialValue}
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
          />

          <div className="pt-4 border-t border-slate-200 space-y-4">
            <label className="inline-flex items-center gap-2 font-bold text-[#102A56] cursor-pointer">
              <input
                type="checkbox"
                checked={draft.businessSameAsResidential}
                onChange={(e) => setDraft({ ...draft, businessSameAsResidential: e.target.checked })}
                className="rounded border-slate-300"
              />
              <span>Business address matches residential address</span>
            </label>

            {!draft.businessSameAsResidential && (
              <IndianAddressFields
                title={role === 'wholesaler' ? 'Registered Office Address' : 'Shop Delivery Address'}
                value={businessValue}
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
              />
            )}
          </div>

          {role === 'wholesaler' && (
            <div className="pt-4 border-t border-slate-200 space-y-4">
              <label className="inline-flex items-center gap-2 font-bold text-[#102A56] cursor-pointer">
                <input
                  type="checkbox"
                  checked={draft.warehouseSameAsBusiness}
                  onChange={(e) => setDraft({ ...draft, warehouseSameAsBusiness: e.target.checked })}
                  className="rounded border-slate-300"
                />
                <span>Warehouse address matches business address</span>
              </label>

              {!draft.warehouseSameAsBusiness && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="sm:col-span-2">
                    <label className="block font-semibold mb-1">Warehouse Street</label>
                    <input
                      type="text"
                      value={draft.warehouseStreet}
                      onChange={(e) => setDraft({ ...draft, warehouseStreet: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Warehouse City</label>
                    <input
                      type="text"
                      value={draft.warehouseCity}
                      onChange={(e) => setDraft({ ...draft, warehouseCity: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Warehouse State</label>
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
                    <label className="block font-semibold mb-1">Warehouse PIN</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={draft.warehousePincode}
                      onChange={(e) => setDraft({ ...draft, warehousePincode: e.target.value.replace(/\D/g, '') })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 bg-[#1769E0] hover:bg-[#102A56] text-white font-bold rounded-xl inline-flex items-center gap-2 cursor-pointer"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Addresses</span>
          </button>
        </form>
      )}

      {/* TAB 4: TAX & KYC */}
      {activeTab === 'kyc' && (
        <form onSubmit={handleSaveKyc} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-extrabold text-[#102A56]">Tax &amp; Verification Status</h2>
              <p className="text-slate-500 mt-0.5">Raw PAN and Aadhaar numbers are never displayed or stored locally.</p>
            </div>
            <span className="font-mono font-bold text-[#1769E0]">
              {draft.panMasked ? `PAN: ${draft.panMasked}` : 'PAN Not Submitted'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Update Business PAN (Optional)</label>
              <input
                type="text"
                maxLength={10}
                value={draft.panInput}
                onChange={(e) => setDraft({ ...draft, panInput: e.target.value.toUpperCase() })}
                placeholder="ABCDE1234F"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase"
              />
            </div>

            <div className="flex items-end pb-2">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={draft.panPurposeConsent}
                  onChange={(e) => setDraft({ ...draft, panPurposeConsent: e.target.checked })}
                  className="mt-0.5 rounded border-slate-300"
                />
                <span>I consent to server-side PAN validation &amp; hashing for tax compliance.</span>
              </label>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block font-semibold text-slate-700">Aadhaar KYC Consent Method (Optional)</label>
            <select
              value={draft.aadhaarMethod}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  aadhaarMethod: e.target.value as OnboardingDraft['aadhaarMethod'],
                  aadhaarConsent: e.target.value === 'none' ? false : draft.aadhaarConsent,
                })
              }
              className="w-full sm:w-80 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="none">None / Skip</option>
              <option value="digilocker_consent">DigiLocker Consent-Based KYC</option>
              <option value="offline_xml_consent">UIDAI Paperless Offline XML Consent</option>
            </select>

            {draft.aadhaarMethod !== 'none' && (
              <label className="flex items-start gap-2 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={draft.aadhaarConsent}
                  onChange={(e) => setDraft({ ...draft, aadhaarConsent: e.target.checked })}
                  className="mt-0.5 rounded border-slate-300"
                />
                <span>I authorize consent-based KYC verification without sharing raw Aadhaar digits.</span>
              </label>
            )}
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 bg-[#1769E0] hover:bg-[#102A56] text-white font-bold rounded-xl inline-flex items-center gap-2 cursor-pointer"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Update Verification</span>
          </button>
        </form>
      )}

      {/* TAB 5: PREFERENCES */}
      {activeTab === 'preferences' && (
        <form onSubmit={handleSavePreferences} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 text-xs">
          <h2 className="text-base font-extrabold text-[#102A56]">Notification &amp; Store Preferences</h2>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 cursor-pointer">
              <div>
                <p className="font-bold text-slate-900">SMS Order Updates</p>
                <p className="text-slate-500">Receive dispatch and delivery alerts on your verified mobile.</p>
              </div>
              <input
                type="checkbox"
                checked={prefs.smsOrderAlerts}
                onChange={(e) => setPrefs({ ...prefs, smsOrderAlerts: e.target.checked })}
                className="rounded border-slate-300"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 cursor-pointer">
              <div>
                <p className="font-bold text-slate-900">WhatsApp B2B Trade Alerts</p>
                <p className="text-slate-500">Get instant stockout warnings and wholesale rate drops.</p>
              </div>
              <input
                type="checkbox"
                checked={prefs.whatsappAlerts}
                onChange={(e) => setPrefs({ ...prefs, whatsappAlerts: e.target.checked })}
                className="rounded border-slate-300"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 cursor-pointer">
              <div>
                <p className="font-bold text-slate-900">Email GST Invoices</p>
                <p className="text-slate-500">Automatically send B2B order summaries to {account.profile.email}.</p>
              </div>
              <input
                type="checkbox"
                checked={prefs.emailInvoices}
                onChange={(e) => setPrefs({ ...prefs, emailInvoices: e.target.checked })}
                className="rounded border-slate-300"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Default Low-Stock Alert Threshold (Units)</label>
              <input
                type="number"
                min={1}
                max={10000}
                value={prefs.lowStockThresholdDefault}
                onChange={(e) => setPrefs({ ...prefs, lowStockThresholdDefault: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Preferred Language</label>
              <select
                value={prefs.language}
                onChange={(e) => setPrefs({ ...prefs, language: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="English (India)">English (India)</option>
                <option value="Hindi">Hindi</option>
                <option value="Kannada">Kannada</option>
                <option value="Tamil">Tamil</option>
                <option value="Telugu">Telugu</option>
                <option value="Marathi">Marathi</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 bg-[#1769E0] hover:bg-[#102A56] text-white font-bold rounded-xl inline-flex items-center gap-2 cursor-pointer"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Preferences</span>
          </button>
        </form>
      )}

      {/* TAB 6: ACCOUNT & DELETION */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 text-xs">
          <div className="space-y-1">
            <h2 className="text-base font-extrabold text-[#102A56]">Account Security &amp; Session</h2>
            <p className="text-slate-600">
              Your account role (<strong className="capitalize">{role}</strong>) is permanently bound to your verified
              identity. To access another role, sign out and register with a different account.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-bold text-slate-900">Account Status</p>
              <p className="text-slate-500 capitalize">
                {account.profile.accountStatus.replace('_', ' ')} · UID {account.profile.uid.slice(0, 12)}...
              </p>
            </div>
            <button
              type="button"
              onClick={() => void onLogout()}
              className="px-4 py-2 bg-[#102A56] hover:bg-[#1769E0] text-white font-bold rounded-xl cursor-pointer"
            >
              Sign Out Session
            </button>
          </div>

          <div className="p-4 rounded-xl bg-red-50/70 border border-red-200 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-bold text-red-900">Request Account Deletion</p>
                <p className="text-red-800/80 mt-0.5 leading-relaxed">
                  Submits a formal deletion request for your VYRO business profile while retaining mandatory tax/order
                  audit logs as required by Indian law.
                </p>
              </div>
              {account.profile.accountStatus !== 'pending_deletion' && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Request Deletion</span>
                </button>
              )}
            </div>

            {account.profile.accountStatus === 'pending_deletion' && (
              <p className="font-bold text-red-700">Deletion request is currently pending review.</p>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 space-y-4 text-xs">
            <h3 className="text-base font-extrabold text-red-900">Confirm Account Deletion Request</h3>
            <p className="text-slate-600 leading-relaxed">
              Please let us know why you would like to close your VYRO business account.
            </p>
            <textarea
              rows={3}
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              placeholder="Reason for account deletion..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => void handleDeletionRequest()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl cursor-pointer"
              >
                {isSaving ? 'Submitting...' : 'Submit Deletion Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
