// ============================================================
// Firebase Configuration & Initialization
// ============================================================
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const hasValidConfig = 
  firebaseConfig.apiKey && 
  !firebaseConfig.apiKey.includes('YOUR_API_KEY') && 
  !firebaseConfig.apiKey.includes('your_api_key_here');

let app: any = null;
let dbInstance: any = null;
let isMockFlag = true;

if (hasValidConfig) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    dbInstance = getFirestore(app);
    isMockFlag = false;
  } catch (e) {
    console.warn("Failed to initialize Firebase Firestore, falling back to Mock Mode:", e);
    isMockFlag = true;
  }
} else {
  console.log("No valid Firebase config detected. Running in IEEE Demo Mode with LocalStorage fallback.");
}

export const isMock = isMockFlag;
export const db = dbInstance;

export default app;
