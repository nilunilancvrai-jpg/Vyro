import React, { useState } from 'react';
import { User } from 'firebase/auth';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Loader2,
  LogOut,
  ShieldAlert,
  ShieldCheck,
  Store,
} from 'lucide-react';
import { UserRole } from '../../types';
import { FullUserAccount } from '../../types/onboarding';
import {
  AuthErrorGuidance,
  mapFirebaseAuthError,
  signInWithGoogle,
} from '../../services/authService';
import { VyroLogo } from '../VyroLogo';

interface GoogleAuthViewProps {
  selectedRole: UserRole;
  roleMismatchAccount?: {
    firebaseUser: User;
    account: FullUserAccount;
    attemptedRole: UserRole;
  } | null;
  onBackToRole: () => void;
  onAuthenticated: (user: User) => Promise<void>;
  onContinueWithRegisteredRole: (user: User, account: FullUserAccount) => void;
  onSignOutAndSwitchAccount: () => Promise<void>;
}

export const GoogleAuthView: React.FC<GoogleAuthViewProps> = ({
  selectedRole,
  roleMismatchAccount = null,
  onBackToRole,
  onAuthenticated,
  onContinueWithRegisteredRole,
  onSignOutAndSwitchAccount,
}) => {
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [isSwitchingAccount, setIsSwitchingAccount] = useState<boolean>(false);
  const [errorInfo, setErrorInfo] = useState<AuthErrorGuidance | null>(null);

  const handleGoogleSignIn = async () => {
    if (isSigningIn) return;
    setErrorInfo(null);
    setIsSigningIn(true);
    try {
      const user = await signInWithGoogle();
      await onAuthenticated(user);
    } catch (err) {
      setErrorInfo(mapFirebaseAuthError(err));
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSwitchAccount = async () => {
    setIsSwitchingAccount(true);
    setErrorInfo(null);
    try {
      await onSignOutAndSwitchAccount();
    } finally {
      setIsSwitchingAccount(false);
    }
  };

  // Explicit Role Mismatch Guard UI (never silently alter an existing user's role)
  if (roleMismatchAccount) {
    const registeredRole = roleMismatchAccount.account.profile.role;
    const attemptedRole = roleMismatchAccount.attemptedRole;
    const email =
      roleMismatchAccount.account.profile.email ||
      roleMismatchAccount.firebaseUser.email ||
      'this Google account';

    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 sm:p-6 font-['Plus_Jakarta_Sans',sans-serif]">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
              <ShieldAlert className="w-3.5 h-3.5" />
              Account Role Mismatch
            </span>
            <VyroLogo size="xs" showTagline={false} />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-extrabold text-[#102A56] tracking-tight">
              Please use your registered account type
            </h1>
            <p className="text-xs text-slate-600 leading-relaxed">
              The Google account <strong className="text-[#102A56]">{email}</strong> is already permanently registered on VYRO as a{' '}
              <strong className="capitalize text-[#102A56]">{registeredRole}</strong>, so it cannot sign in as a{' '}
              <strong className="capitalize text-red-700">{attemptedRole}</strong>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl text-white flex items-center justify-center shrink-0 ${
                registeredRole === 'wholesaler' ? 'bg-[#0EA5A4]' : 'bg-[#1769E0]'
              }`}
            >
              {registeredRole === 'wholesaler' ? (
                <Building2 className="w-5 h-5" />
              ) : (
                <Store className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#102A56] capitalize">
                Registered Role: {registeredRole}
              </p>
              <p className="text-[11px] text-slate-500 truncate">{email}</p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              id="continue-registered-role-btn"
              onClick={() =>
                onContinueWithRegisteredRole(
                  roleMismatchAccount.firebaseUser,
                  roleMismatchAccount.account
                )
              }
              className="w-full py-3.5 px-4 bg-[#1769E0] hover:bg-[#102A56] text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="capitalize">Continue to {registeredRole} Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              id="switch-google-account-btn"
              disabled={isSwitchingAccount}
              onClick={() => void handleSwitchAccount()}
              className="w-full py-3 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSwitchingAccount ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              <span>Sign Out &amp; Use Different Google Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 sm:p-6 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToRole}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#102A56] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Change account type</span>
          </button>
          <VyroLogo size="xs" showTagline={false} />
        </div>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#1769E0]">
            {selectedRole === 'wholesaler' ? (
              <Building2 className="w-4 h-4 text-[#0EA5A4]" />
            ) : (
              <Store className="w-4 h-4 text-[#1769E0]" />
            )}
            <span className="capitalize">{selectedRole} Authentication · Google Sign-In</span>
          </div>

          <h1 className="text-2xl font-extrabold text-[#102A56] tracking-tight">
            Sign in with your Google account
          </h1>

          <p className="text-xs text-slate-600 leading-relaxed">
            Authenticate securely with Google to access your registered{' '}
            <strong className="text-[#102A56] capitalize">{selectedRole}</strong> dashboard or set up a new{' '}
            <strong className="text-[#102A56] capitalize">{selectedRole}</strong> business profile.
          </p>
        </div>

        {errorInfo && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 space-y-1.5">
            <div className="flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span className="font-medium leading-relaxed">{errorInfo.message}</span>
            </div>
            {errorInfo.needsConsoleConfig && (
              <p className="text-[11px] text-red-700 pl-6 leading-relaxed">
                Ensure Google Sign-In is enabled in Firebase Authentication and this app domain is added under Authorized Domains.
              </p>
            )}
          </div>
        )}

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Selected Account Type</span>
            <span
              className={`font-extrabold capitalize ${
                selectedRole === 'wholesaler' ? 'text-[#0EA5A4]' : 'text-[#1769E0]'
              }`}
            >
              {selectedRole}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            New accounts are permanently created with this role. Existing accounts must sign in using their registered role.
          </p>
        </div>

        <button
          type="button"
          id="continue-with-google-btn"
          disabled={isSigningIn}
          onClick={() => void handleGoogleSignIn()}
          className="w-full py-3.5 px-4 bg-[#1769E0] hover:bg-[#102A56] disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-3 shadow-xs cursor-pointer"
        >
          {isSigningIn ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Connecting to Google...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 shrink-0 bg-white rounded-full p-0.5" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.3 0 6.08-1.09 8.1-2.96l-3.88-3.05c-1.09.73-2.49 1.16-4.22 1.16-3.24 0-5.98-2.19-6.96-5.13H1.04v3.14C3.05 21.15 7.21 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.04 14.02c-.25-.73-.39-1.51-.39-2.32s.14-1.59.39-2.32V6.24H1.04C.38 7.56 0 9.04 0 11.7s.38 4.14 1.04 5.46l4-3.14z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.8 0 3.41.62 4.68 1.83l3.51-3.51C18.08 1.19 15.3 0 12 0 7.21 0 3.05 2.85 1.04 7.04l4 3.14c.98-2.94 3.72-5.13 6.96-5.13z"
                />
              </svg>
              <span>Continue with Google</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Protected by Firebase Google Auth &amp; Firestore Roles</span>
          <ShieldCheck className="w-4 h-4 text-[#0EA5A4] shrink-0" />
        </div>
      </div>
    </div>
  );
};
