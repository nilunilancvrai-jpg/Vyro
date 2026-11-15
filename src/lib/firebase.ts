import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// CRITICAL: Pass firestoreDatabaseId from firebase-applet-config.json
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();

const LOCAL_EMULATOR_HOSTNAMES = new Set(['localhost', '127.0.0.1', '[::1]']);

function resolveAuthEmulatorUrl(): string | null {
  // Production safety gate: never connect production builds or non-local origins to an emulator
  if (import.meta.env.PROD || !import.meta.env.DEV) {
    return null;
  }
  if (import.meta.env.VITE_USE_FIREBASE_AUTH_EMULATOR !== 'true') {
    return null;
  }
  if (typeof window !== 'undefined' && !LOCAL_EMULATOR_HOSTNAMES.has(window.location.hostname)) {
    return null;
  }

  const configuredUrl = (
    import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_URL || 'http://127.0.0.1:9099'
  ).trim();
  if (!/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?(\/.*)?$/.test(configuredUrl)) {
    return null;
  }
  return configuredUrl.replace(/\/+$/, '');
}

export const authEmulatorUrl =
  import.meta.env.DEV &&
  !import.meta.env.PROD &&
  import.meta.env.VITE_USE_FIREBASE_AUTH_EMULATOR === 'true'
    ? resolveAuthEmulatorUrl()
    : null;
export const isAuthEmulatorEnabled = Boolean(authEmulatorUrl);

if (
  import.meta.env.DEV &&
  !import.meta.env.PROD &&
  authEmulatorUrl
) {
  const authInternal = auth as typeof auth & { emulatorConfig?: unknown };
  if (!authInternal.emulatorConfig) {
    connectAuthEmulator(auth, authEmulatorUrl, { disableWarnings: false });
  }
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    phoneNumber?: string | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid ?? null,
      email: auth.currentUser?.email ?? null,
      emailVerified: auth.currentUser?.emailVerified ?? null,
      phoneNumber: auth.currentUser?.phoneNumber ?? null,
      isAnonymous: auth.currentUser?.isAnonymous ?? null,
      tenantId: auth.currentUser?.tenantId ?? null,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Firebase Firestore client appears offline. Verify firebase-applet-config.json.');
    }
    return false;
  }
}
