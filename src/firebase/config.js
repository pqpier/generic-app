import { initializeApp } from "firebase/app";
import { initializeFirestore, serverTimestamp } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

// TODO: Colocar o firebaseConfig do seu app aqui abaixo
const firebaseConfig = {
  apiKey: "AIzaSyATBmIbOGfKPYmXY2UwBstIhqV_M00pBgI",
  authDomain: "template-90106.firebaseapp.com",
  projectId: "template-90106",
  storageBucket: "template-90106.appspot.com",
  messagingSenderId: "692560077016",
  appId: "1:692560077016:web:8f07639aba2297dab7b7ad",
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

const messaging = getMessaging(firebaseApp);

// TODO: Descomentar código abaixo após ativar o App Check

// const appCheck = initializeAppCheck(firebaseApp, {
//   provider: new ReCaptchaV3Provider("abcdefghijklmnopqrstuvwxy-1234567890abcd"), // TODO: Colocar a chave do seu reCAPTCHA v3
//   isTokenAutoRefreshEnabled: true,
// });

// Initialize services
const db = initializeFirestore(firebaseApp, {
  ignoreUndefinedProperties: true,
});
const auth = getAuth(firebaseApp);
const storage = getStorage(firebaseApp);

// Timestamp
const timestamp = serverTimestamp();

// Google Sign In
const googleProvider = new GoogleAuthProvider();

export { db, auth, storage, timestamp, googleProvider, messaging };
