import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore, getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import appletConfig from '../../firebase-applet-config.json';

export const firebaseConfig = {
  apiKey: appletConfig.apiKey || "AIzaSyAH_IWTgtcG7STm66HRPfxEci4EUXYxBV0",
  authDomain: appletConfig.authDomain || "cbt-feb-upnvj.firebaseapp.com",
  projectId: appletConfig.projectId || "cbt-feb-upnvj",
  storageBucket: appletConfig.storageBucket || "cbt-feb-upnvj.firebasestorage.app",
  messagingSenderId: appletConfig.messagingSenderId || "314086597951",
  appId: appletConfig.appId || "1:314086597951:web:7117f906469d7b4f1e5f8a"
};

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

const customDbId = (appletConfig.firestoreDatabaseId && appletConfig.firestoreDatabaseId !== '(default)' && appletConfig.firestoreDatabaseId !== '')
  ? appletConfig.firestoreDatabaseId
  : undefined;

// Robust Firestore Initialization with Long Polling Auto-detection for preview iframes
export const db = (() => {
  try {
    return initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true
    }, customDbId);
  } catch {
    return customDbId ? getFirestore(app, customDbId) : getFirestore(app);
  }
})();

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Error handling compliant with Firebase Integration Skill
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
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: errorMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  if (errorMessage.includes('client is offline')) {
    console.warn('Firestore Client Offline (using local cache/fallback):', JSON.stringify(errInfo));
  } else {
    console.error('Firestore Error:', JSON.stringify(errInfo));
  }
  return errInfo;
}

// Test connection on boot
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Koneksi Firestore offline atau belum terhubung ke cloud server.");
    }
    return false;
  }
}
