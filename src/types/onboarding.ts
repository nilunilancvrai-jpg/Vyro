import { UserRole } from '../types';

export interface ProfileRecord {
  uid: string;
  role: UserRole;
  phoneNumber: string;
  fullName: string;
  email: string;
  photoUrl?: string;
  dateOfBirth?: string;
  gender?: '' | 'male' | 'female' | 'other' | 'prefer_not_to_say';
  onboardingCompleted: boolean;
  onboardingStep: number;
  accountStatus: 'active' | 'pending_deletion';
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface BusinessRecord {
  uid: string;
  role: UserRole;
  businessName: string;
  businessType: string;
  businessCategory: string;
  gstin?: string;
  registrationNumber?: string;
  apmcLicense?: string;
  logoUrl?: string;
  facilityPhotoUrl?: string;
  bankAccountHolder?: string;
  bankAccountLast4?: string;
  bankIfsc?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface BusinessAddressRecord {
  uid: string;
  residentialCountry: string;
  residentialState: string;
  residentialDistrict: string;
  residentialCity: string;
  residentialLocality: string;
  residentialStreet: string;
  residentialPincode: string;
  businessSameAsResidential: boolean;
  businessCountry: string;
  businessState: string;
  businessDistrict: string;
  businessCity: string;
  businessLocality: string;
  businessStreet: string;
  businessPincode: string;
  warehouseSameAsBusiness?: boolean;
  warehouseStreet?: string;
  warehouseCity?: string;
  warehouseState?: string;
  warehousePincode?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface BusinessVerificationRecord {
  uid: string;
  panProvided: boolean;
  panMasked?: string;
  panHash?: string;
  panPurposeConsent: boolean;
  aadhaarMethod: 'none' | 'digilocker_consent' | 'offline_xml_consent';
  aadhaarConsent: boolean;
  aadhaarVerified: boolean;
  kycStatus: 'unverified' | 'pending_review' | 'verified';
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface UserPreferenceRecord {
  uid: string;
  whatsappAlerts: boolean;
  smsOrderAlerts: boolean;
  emailInvoices: boolean;
  lowStockThresholdDefault: number;
  language: string;
  updatedAt?: unknown;
}

export interface FullUserAccount {
  profile: ProfileRecord;
  business: BusinessRecord | null;
  address: BusinessAddressRecord | null;
  verification: BusinessVerificationRecord | null;
  preferences: UserPreferenceRecord | null;
}

export interface OnboardingDraft {
  // Step 1: Personal
  fullName: string;
  phoneNumber: string;
  email: string;
  photoUrl: string;
  dateOfBirth: string;
  gender: '' | 'male' | 'female' | 'other' | 'prefer_not_to_say';
  // Step 2: Business
  businessName: string;
  businessType: string;
  businessCategory: string;
  gstin: string;
  registrationNumber: string;
  apmcLicense: string;
  logoUrl: string;
  facilityPhotoUrl: string;
  includeBankDetails: boolean;
  bankAccountHolder: string;
  bankAccountNumber: string; // Never stored in plaintext; only last4 saved
  bankAccountLast4: string;
  bankIfsc: string;
  // Step 3: Addresses
  residentialCountry: string;
  residentialState: string;
  residentialDistrict: string;
  residentialCity: string;
  residentialLocality: string;
  residentialStreet: string;
  residentialPincode: string;
  businessSameAsResidential: boolean;
  businessCountry: string;
  businessState: string;
  businessDistrict: string;
  businessCity: string;
  businessLocality: string;
  businessStreet: string;
  businessPincode: string;
  warehouseSameAsBusiness: boolean;
  warehouseStreet: string;
  warehouseCity: string;
  warehouseState: string;
  warehousePincode: string;
  // Step 4: Verification
  panInput: string;
  panMasked: string;
  panHash: string;
  panPurposeConsent: boolean;
  aadhaarMethod: 'none' | 'digilocker_consent' | 'offline_xml_consent';
  aadhaarConsent: boolean;
}
