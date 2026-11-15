import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { ArrowRight, Store, Building2, CheckCircle2 } from 'lucide-react';
import { UserRole } from '../../types';
import { FullUserAccount } from '../../types/onboarding';
import { setPendingAuthRole } from '../../services/authService';
import { VyroLogo } from '../VyroLogo';
import { AuthFlow } from './AuthFlow';

interface LoginPageProps {
  existingFirebaseUser?: User | null;
  existingAccount?: FullUserAccount | null;
  onAuthComplete?: (user: User, account: FullUserAccount) => void;
  onSelectRole?: (role: UserRole) => void;
}

/**
 * Legacy role-selection entry point updated so selecting Retailer or Wholesaler
 * ALWAYS navigates to Firebase Mobile OTP / Google Authentication first and
 * NEVER bypasses authentication to open a dashboard directly.
 */
export const LoginPage: React.FC<LoginPageProps> = ({
  existingFirebaseUser = null,
  existingAccount = null,
  onAuthComplete,
  onSelectRole,
}) => {
  const [selectedRoleForAuth, setSelectedRoleForAuth] = useState<UserRole | null>(null);

  const handleSelectRole = (selectedRole: UserRole) => {
    setPendingAuthRole(selectedRole);
    if (onSelectRole) {
      onSelectRole(selectedRole);
      return;
    }
    setSelectedRoleForAuth(selectedRole);
  };

  if (selectedRoleForAuth) {
    return (
      <AuthFlow
        existingFirebaseUser={existingFirebaseUser}
        existingAccount={existingAccount}
        initialScreen="phone"
        initialRole={selectedRoleForAuth}
        onAuthComplete={(user, account) => {
          onAuthComplete?.(user, account);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F1F5F9] via-[#F8FAFC] to-[#EFF6FF] flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-orange-200/40 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md z-10">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl shadow-slate-900/5 p-6 sm:p-8 backdrop-blur-sm">
          <div className="space-y-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative p-2 rounded-full bg-white shadow-xs border border-slate-100 mb-3 hover:scale-105 transition-transform">
                <VyroLogo size="xl" variant="symbol" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#102A56] tracking-tight">
                VY<span className="text-[#1769E0]">R</span><span className="text-[#0EA5A4]">O</span>
              </h1>
              <p className="text-xs font-bold uppercase tracking-widest text-[#64748B] mt-0.5">
                Business, Connected.
              </p>
              <div className="mt-3">
                <h2 className="text-lg sm:text-xl font-black text-[#102A56] tracking-tight">
                  What type of account do you have?
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Select your role to continue to Mobile OTP or Google Sign-In
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              <button
                id="open-retailer-dashboard-btn"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelectRole('retailer');
                }}
                className="w-full text-left p-4 sm:p-5 rounded-2xl border-2 border-slate-200 hover:border-[#1769E0] bg-white hover:bg-blue-50/40 transition-all group focus:outline-none focus:ring-2 focus:ring-[#1769E0] focus:ring-offset-2 shadow-xs cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-[#102A56] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                    <Store className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-black text-[#102A56] group-hover:text-[#1769E0] transition-colors">
                        Retailer
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#1769E0] text-[10px] font-black uppercase tracking-wider">
                        Buyer
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">
                      For Kirana stores, supermarkets &amp; retail merchants buying wholesale stock.
                    </p>
                    <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-bold text-[#1769E0]">
                      <span>Continue to Mobile Authentication</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </button>

              <button
                id="open-wholesaler-dashboard-btn"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelectRole('wholesaler');
                }}
                className="w-full text-left p-4 sm:p-5 rounded-2xl border-2 border-slate-200 hover:border-[#0EA5A4] bg-white hover:bg-teal-50/40 transition-all group focus:outline-none focus:ring-2 focus:ring-[#0EA5A4] focus:ring-offset-2 shadow-xs cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0EA5A4] to-[#0A6B6A] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-black text-[#102A56] group-hover:text-[#0EA5A4] transition-colors">
                        Wholesaler
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-[#0EA5A4] text-[10px] font-black uppercase tracking-wider">
                        Supplier
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">
                      For Stockists, APMC distributors &amp; bulk suppliers managing inventory and orders.
                    </p>
                    <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-bold text-[#0EA5A4]">
                      <span>Continue to Mobile Authentication</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </button>
            </div>

            <div className="text-center text-[11px] text-slate-400 font-medium pt-1">
              Firebase Mobile OTP or Google authentication is required before accessing your dashboard.
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-400 font-medium flex items-center justify-center gap-4">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Verified B2B Network
          </span>
          <span>•</span>
          <span>APMC &amp; GST Compliant</span>
          <span>•</span>
          <span>256-Bit SSL Secure</span>
        </div>
      </div>
    </div>
  );
};
