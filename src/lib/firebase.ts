import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/**
 * Configuración web pública del proyecto Firebase `miapp-4a216`.
 * Son identificadores de cliente (viajan en cualquier bundle web); la
 * seguridad real vive en firestore.rules, no en estas claves.
 */
export const firebaseConfig = {
  apiKey: "AIzaSyCn9yWVnz2l-_A41ombelQmXDyA9MC0Lvk",
  authDomain: "miapp-4a216.firebaseapp.com",
  projectId: "miapp-4a216",
  storageBucket: "miapp-4a216.firebasestorage.app",
  messagingSenderId: "553513944411",
  appId: "1:553513944411:web:c4b3592357220c9f63c67e",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
