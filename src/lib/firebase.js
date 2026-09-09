// Firebase app + Auth singleton.
//
// Config comes entirely from Vite env vars (VITE_FIREBASE_*) so no values
// are hard-coded — see .env.example. They ship in the client bundle by
// design (not secrets in the "keep off GitHub" sense), but living in .env
// lets each environment point at its own Firebase project without a code
// change.
//
// Auth persistence is Firebase's default (browserLocalPersistence): the
// signed-in user survives a page refresh and browser restart until they
// explicitly log out — requirement (4), handled by the SDK.
//
// If the env vars are missing we DON'T throw: `auth` is exported as null and
// the rest of the app (landing page, and every non-auth feature) keeps
// working. Only login/signup surface a "Firebase isn't configured" message.
// This keeps the migration safe to land before the Console setup is done.

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
);

let auth = null;

if (isFirebaseConfigured) {
  // Vite HMR can re-run this module; guard against double-initialising.
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
} else {
  console.warn(
    "[firebase] VITE_FIREBASE_* env vars are not set — auth is disabled. " +
      "Copy .env.example to .env, fill in your Firebase web app config, and restart the dev server."
  );
}

export { auth };
