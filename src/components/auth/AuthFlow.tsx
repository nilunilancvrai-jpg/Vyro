import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { Loader2, ShieldAlert } from 'lucide-react';
import { UserRole } from '../../types';
import { FullUserAccount } from '../../types/onboarding';
import {
  clearPendingAuthRole,
  ensureInitialProfileForNewUser,
  getPendingAuthRole,
  resolveAuthenticatedAccount,
  setPendingAuthRole,
  signOutAccount,
} from '../../services/authService';
import { WelcomeView } from './WelcomeView';
import { AccountTypeView } from './AccountTypeView';
import { GoogleAuthView } from './GoogleAuthView';
import { OnboardingWizard } from './OnboardingWizard';

interface AuthFlowProps {
  existingFirebaseUser: User | null;
  existingAccount: FullUserAccount | null;
  initialScreen?: 'welcome' | 'role' | 'google';
  initialRole?: UserRole;
  onAuthComplete: (user: User, account: FullUserAccount) => void;
  onResolveMismatch?: (user: User, account: FullUserAccount) => void;
}

type AuthScreen = 'welcome' | 'role' | 'google' | 'onboarding';

export const AuthFlow: React.FC<AuthFlowProps> = ({
  existingFirebaseUser,
  existingAccount,
  initialScreen: requestedInitialScreen,
  initialRole: requestedInitialRole,
  onAuthComplete,
  onResolveMismatch,
}) => {
  const pendingRole = getPendingAuthRole();
  const hasInitialRoleMismatch = Boolean(
    existingFirebaseUser &&
      existingAccount &&
      pendingRole &&
      existingAccount.profile.role !== pendingRole
  );
  const needsOnboarding = Boolean(
    existingFirebaseUser &&
      existingAccount &&
      !existingAccount.profile.onboardingCompleted &&
      !hasInitialRoleMismatch
  );

  const initialScreen: AuthScreen = hasInitialRoleMismatch
    ? 'google'
    : needsOnboarding
    ? 'onboarding'
    : requestedInitialScreen || 'welcome';

  const [screen, setScreen] = useState<AuthScreen>(initialScreen);
  const [selectedRole, setSelectedRole] = useState<UserRole>(
    pendingRole || existingAccount?.profile.role || requestedInitialRole || 'retailer'
  );
  const [authUser, setAuthUser] = useState<User | null>(existingFirebaseUser);
  const [loadedAccount, setLoadedAccount] = useState<FullUserAccount | null>(existingAccount);
  const [roleMismatchAccount, setRoleMismatchAccount] = useState<{
    firebaseUser: User;
    account: FullUserAccount;
    attemptedRole: UserRole;
  } | null>(
    hasInitialRoleMismatch && existingFirebaseUser && existingAccount && pendingRole
      ? {
          firebaseUser: existingFirebaseUser,
          account: existingAccount,
          attemptedRole: pendingRole,
        }
      : null
  );
  const [isLoadingAccount, setIsLoadingAccount] = useState<boolean>(false);
  const [flowError, setFlowError] = useState<string | null>(null);

  useEffect(() => {
    if (existingFirebaseUser) {
      setAuthUser(existingFirebaseUser);
      setLoadedAccount(existingAccount);

      const currentPending = getPendingAuthRole();
      if (existingAccount && currentPending && existingAccount.profile.role !== currentPending) {
        setSelectedRole(currentPending);
        setRoleMismatchAccount({
          firebaseUser: existingFirebaseUser,
          account: existingAccount,
          attemptedRole: currentPending,
        });
        setScreen('google');
        return;
      }

      if (existingAccount && !existingAccount.profile.onboardingCompleted) {
        setRoleMismatchAccount(null);
        setSelectedRole(existingAccount.profile.role);
        setScreen('onboarding');
      }
    } else {
      setAuthUser(null);
      setLoadedAccount(null);
      setRoleMismatchAccount(null);
    }
  }, [existingFirebaseUser, existingAccount]);

  const handleRoleChosenForAuth = (role: UserRole) => {
    setSelectedRole(role);
    setPendingAuthRole(role);
    setRoleMismatchAccount(null);
    setFlowError(null);
    setScreen('google');
  };

  const handleGoogleAuthenticated = async (user: User) => {
    setFlowError(null);
    setIsLoadingAccount(true);
    try {
      const roleForAuth = getPendingAuthRole() || selectedRole;

      // 1. Verify Google ID token with VYRO backend & check existing Firestore profile
      let account = await resolveAuthenticatedAccount(user);

      // 2. New user -> create initial profile permanently bound to selectedRole
      if (!account) {
        account = await ensureInitialProfileForNewUser(user, roleForAuth);
      }

      setAuthUser(user);
      setLoadedAccount(account);

      // 3. Existing user with different registered role -> block and require registered role
      if (account.profile.role !== roleForAuth) {
        setRoleMismatchAccount({
          firebaseUser: user,
          account,
          attemptedRole: roleForAuth,
        });
        setScreen('google');
        return;
      }

      setRoleMismatchAccount(null);
      setSelectedRole(account.profile.role);

      if (account.profile.onboardingCompleted) {
        clearPendingAuthRole();
        onAuthComplete(user, account);
        return;
      }

      setScreen('onboarding');
    } catch (err) {
      setFlowError(
        err instanceof Error
          ? err.message
          : 'Could not verify your Google account session. Please try again.'
      );
    } finally {
      setIsLoadingAccount(false);
    }
  };

  const handleContinueWithRegisteredRole = (user: User, account: FullUserAccount) => {
    clearPendingAuthRole();
    setRoleMismatchAccount(null);
    setSelectedRole(account.profile.role);
    setAuthUser(user);
    setLoadedAccount(account);

    if (account.profile.onboardingCompleted) {
      if (onResolveMismatch) {
        onResolveMismatch(user, account);
      } else {
        onAuthComplete(user, account);
      }
      return;
    }

    setScreen('onboarding');
  };

  const handleSignOutAndReset = async () => {
    await signOutAccount();
    setAuthUser(null);
    setLoadedAccount(null);
    setRoleMismatchAccount(null);
    setFlowError(null);
    setScreen('role');
  };

  const handleSignOutFromOnboarding = async () => {
    await signOutAccount();
    setAuthUser(null);
    setLoadedAccount(null);
    setRoleMismatchAccount(null);
    setScreen('welcome');
  };

  if (isLoadingAccount) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 font-['Plus_Jakarta_Sans',sans-serif]">
        <Loader2 className="w-8 h-8 text-[#1769E0] animate-spin mb-3" />
        <p className="text-sm font-bold text-[#102A56]">Verifying your Google account...</p>
        <p className="text-xs text-slate-500 mt-1">Checking Firestore profile and assigned role permissions</p>
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

      {screen === 'google' && (
        <GoogleAuthView
          selectedRole={selectedRole}
          roleMismatchAccount={roleMismatchAccount}
          onBackToRole={() => setScreen('role')}
          onAuthenticated={handleGoogleAuthenticated}
          onContinueWithRegisteredRole={handleContinueWithRegisteredRole}
          onSignOutAndSwitchAccount={async () => {
            await signOutAccount();
            setPendingAuthRole(selectedRole);
            setAuthUser(null);
            setLoadedAccount(null);
            setRoleMismatchAccount(null);
            setFlowError(null);
          }}
        />
      )}

      {screen === 'onboarding' && authUser && (
        <OnboardingWizard
          firebaseUser={authUser}
          role={loadedAccount?.profile.role || selectedRole}
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
