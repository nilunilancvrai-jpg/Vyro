import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { Loader2, ShieldAlert } from 'lucide-react';
import { UserRole } from '../../types';
import { FullUserAccount } from '../../types/onboarding';
import {
  clearPendingAuthRole,
  getPendingAuthRole,
  resolveAuthenticatedAccount,
  setPendingAuthRole,
  signOutAccount,
} from '../../services/authService';
import { WelcomeView } from './WelcomeView';
import { AccountTypeView } from './AccountTypeView';
import { PhoneAuthView } from './PhoneAuthView';
import { OnboardingWizard } from './OnboardingWizard';

interface AuthFlowProps {
  existingFirebaseUser: User | null;
  existingAccount: FullUserAccount | null;
  initialScreen?: 'welcome' | 'role' | 'phone';
  initialRole?: UserRole;
  onAuthComplete: (user: User, account: FullUserAccount) => void;
}

type AuthScreen = 'welcome' | 'role' | 'phone' | 'onboarding';

export const AuthFlow: React.FC<AuthFlowProps> = ({
  existingFirebaseUser,
  existingAccount,
  initialScreen: requestedInitialScreen,
  initialRole: requestedInitialRole,
  onAuthComplete,
}) => {
  const needsOnboarding = Boolean(
    existingFirebaseUser && (!existingAccount || !existingAccount.profile.onboardingCompleted)
  );

  const initialScreen: AuthScreen = needsOnboarding
    ? 'onboarding'
    : requestedInitialScreen || 'welcome';

  const [screen, setScreen] = useState<AuthScreen>(initialScreen);
  const [selectedRole, setSelectedRole] = useState<UserRole>(
    existingAccount?.profile.role || requestedInitialRole || getPendingAuthRole() || 'retailer'
  );
  const [authUser, setAuthUser] = useState<User | null>(existingFirebaseUser);
  const [verifiedPhone, setVerifiedPhone] = useState<string>(
    existingAccount?.profile.phoneNumber || existingFirebaseUser?.phoneNumber || ''
  );
  const [loadedAccount, setLoadedAccount] = useState<FullUserAccount | null>(existingAccount);
  const [isLoadingAccount, setIsLoadingAccount] = useState<boolean>(false);
  const [flowError, setFlowError] = useState<string | null>(null);

  useEffect(() => {
    if (existingFirebaseUser) {
      setAuthUser(existingFirebaseUser);
      setLoadedAccount(existingAccount);
      setVerifiedPhone((prev) => existingAccount?.profile.phoneNumber || existingFirebaseUser.phoneNumber || prev);
      if (existingAccount?.profile.role) {
        setSelectedRole(existingAccount.profile.role);
      }
      if (!existingAccount || !existingAccount.profile.onboardingCompleted) {
        setScreen('onboarding');
      }
    } else {
      setAuthUser(null);
      setLoadedAccount(null);
    }
  }, [existingFirebaseUser, existingAccount]);

  const handleRoleChosenForAuth = (role: UserRole) => {
    setSelectedRole(role);
    setPendingAuthRole(role);
    setFlowError(null);
    setScreen('phone');
  };

  // Shared post-auth handler for BOTH Phone OTP and Google Sign-In
  const handleAuthenticated = async (user: User, phoneNumber: string) => {
    setFlowError(null);
    setIsLoadingAccount(true);
    try {
      // 1. Verify Firebase ID token with VYRO backend & load Firestore business registration status
      const account = await resolveAuthenticatedAccount(user);
      setAuthUser(user);
      setVerifiedPhone(phoneNumber);
      setLoadedAccount(account);

      if (account) {
        // Permanently enforce registered account role from backend/Firestore
        const permanentRole = account.profile.role;
        setSelectedRole(permanentRole);

        if (account.profile.onboardingCompleted) {
          clearPendingAuthRole();
          onAuthComplete(user, account);
          return;
        }
        // Incomplete business registration -> resume OnboardingWizard
        setScreen('onboarding');
      } else {
        // New user -> preserve chosen role and go to business registration
        setScreen('onboarding');
      }
    } catch (err) {
      setFlowError(
        err instanceof Error
          ? err.message
          : 'Could not verify your account session. Please try again.'
      );
    } finally {
      setIsLoadingAccount(false);
    }
  };

  const handleSignOutFromOnboarding = async () => {
    await signOutAccount();
    setAuthUser(null);
    setLoadedAccount(null);
    setVerifiedPhone('');
    setScreen('welcome');
  };

  if (isLoadingAccount) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 font-['Plus_Jakarta_Sans',sans-serif]">
        <Loader2 className="w-8 h-8 text-[#1769E0] animate-spin mb-3" />
        <p className="text-sm font-bold text-[#102A56]">Verifying your VYRO account...</p>
        <p className="text-xs text-slate-500 mt-1">Checking role permissions and onboarding status</p>
      </div>
    );
  }

  return (
    <>
      {flowError && (
        <div className="fixed top-4 right-4 z-50 max-w-md bg-red-50 border border-red-200 rounded-xl p-4 text-xs text-red-800 shadow-lg flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">Authentication Error</p>
            <p className="mt-0.5">{flowError}</p>
          </div>
          <button
            type="button"
            onClick={() => setFlowError(null)}
            className="text-red-600 font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {screen === 'welcome' && (
        <WelcomeView
          onContinueWithMobile={() => setScreen('role')}
          onSelectRole={handleRoleChosenForAuth}
        />
      )}

      {screen === 'role' && (
        <AccountTypeView
          initialRole={selectedRole}
          onBack={() => setScreen('welcome')}
          onSelectRole={handleRoleChosenForAuth}
        />
      )}

      {screen === 'phone' && (
        <PhoneAuthView
          selectedRole={selectedRole}
          onBackToRole={() => setScreen('role')}
          onAuthenticated={handleAuthenticated}
        />
      )}

      {screen === 'onboarding' && authUser && (
        <OnboardingWizard
          firebaseUser={authUser}
          role={loadedAccount?.profile.role || selectedRole}
          initialPhone={verifiedPhone}
          existingAccount={loadedAccount}
          onCompleted={(completedAccount) => {
            clearPendingAuthRole();
            onAuthComplete(authUser, completedAccount);
          }}
          onSignOut={handleSignOutFromOnboarding}
        />
      )}
    </>
  );
};
