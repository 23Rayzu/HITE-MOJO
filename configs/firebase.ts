import { initializeApp, getApp, getApps, FirebaseApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, getAuth, Auth } from "firebase/auth";
import { getDatabase, Database } from "firebase/database";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDdIXQz0nHb2QfOyovyDJYieF_Jp5mdBT8", // Ganti dengan API Key Anda
  authDomain: "pgpbl2025-cf1c0.firebaseapp.com",
  databaseURL: "https://pgpbl2025-cf1c0-default-rtdb.firebaseio.com",
  projectId: "pgpbl2025-cf1c0",
  messagingSenderId: "6251154213",
  appId: "1:6251154213:web:deed5c658749cdd6d8a8cc",
  measurementId: "G-LJZWHGJ5NH"
};

let app: FirebaseApp;
let auth: Auth; 

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });
  } catch (e) {
    auth = getAuth(app);
  }
} else {
  app = getApp();
  auth = getAuth(app);
}

const db: Database = getDatabase(app);

export { app, auth, db };