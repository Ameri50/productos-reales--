import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { ADMIN_EMAILS, type UserProfile } from "@/lib/types";

const AUTH_ERRORS: Record<string, string> = {
  "auth/invalid-email": "El correo no tiene un formato válido.",
  "auth/user-not-found": "No existe una cuenta con ese correo.",
  "auth/wrong-password": "La contraseña es incorrecta.",
  "auth/invalid-credential": "Correo o contraseña incorrectos.",
  "auth/email-already-in-use": "Ese correo ya está registrado. Inicia sesión.",
  "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
  "auth/too-many-requests":
    "Demasiados intentos. Espera unos minutos y vuelve a probar.",
  "auth/network-request-failed":
    "Sin conexión con el servidor. Revisa tu internet.",
  "auth/operation-not-allowed":
    "El acceso con correo y contraseña no está habilitado en Firebase.",
};

export function authErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = String((error as { code: unknown }).code);
    if (AUTH_ERRORS[code]) return AUTH_ERRORS[code];
  }
  return "No pudimos completar la operación. Inténtalo de nuevo.";
}

function emptyProfile(user: User): UserProfile {
  return {
    uid: user.uid,
    nombre: user.displayName?.trim() || "",
    apellido: "",
    email: (user.email ?? "").toLowerCase(),
    telefono: "",
    direccion: "",
    edad: "",
    isAdmin: ADMIN_EMAILS.includes((user.email ?? "").toLowerCase()),
  };
}

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  displayName: string;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  saveProfile: (updates: Partial<UserProfile>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
      if (!nextUser) setProfile(null);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    const fallback = emptyProfile(user);

    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        const data = snapshot.data();
        setProfile({
          ...fallback,
          uid: user.uid,
          nombre:
            (typeof data?.nombre === "string" && data.nombre.trim()) ||
            fallback.nombre,
          apellido: typeof data?.apellido === "string" ? data.apellido : "",
          email: (typeof data?.email === "string" && data.email) || fallback.email,
          telefono: typeof data?.telefono === "string" ? data.telefono : "",
          direccion: typeof data?.direccion === "string" ? data.direccion : "",
          edad: typeof data?.edad === "string" ? data.edad : "",
          isAdmin: fallback.isAdmin,
        });

        if (!snapshot.exists()) {
          void setDoc(
            ref,
            {
              uid: user.uid,
              nombre: fallback.nombre,
              email: fallback.email,
              isGuest: false,
              isAdmin: fallback.isAdmin,
              online: true,
              platform: "web",
              lastLoginAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            },
            { merge: true },
          ).catch(() => {
            // Reglas estrictas o sin permisos: el perfil sigue en memoria.
          });
        }
      },
      () => setProfile(fallback),
    );

    return unsubscribe;
  }, [user]);

  const signIn = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), password);
  }, []);

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const credentials = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );
      const finalName = name.trim();
      if (finalName) {
        await updateProfile(credentials.user, { displayName: finalName });
      }
      await setDoc(
        doc(db, "users", credentials.user.uid),
        {
          uid: credentials.user.uid,
          nombre: finalName,
          email: credentials.user.email?.toLowerCase() ?? email.trim(),
          isGuest: false,
          isAdmin: ADMIN_EMAILS.includes(
            (credentials.user.email ?? "").toLowerCase(),
          ),
          online: true,
          platform: "web",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
    },
    [],
  );

  const signOutUser = useCallback(async () => {
    await signOut(auth);
  }, []);

  const saveProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      if (!user) throw new Error("No hay una sesión activa.");
      await setDoc(
        doc(db, "users", user.uid),
        { ...updates, uid: user.uid, updatedAt: serverTimestamp() },
        { merge: true },
      );
      if (updates.nombre) {
        await updateProfile(user, { displayName: updates.nombre }).catch(
          () => undefined,
        );
      }
    },
    [user],
  );

  const resetPassword = useCallback(async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const isAdmin = ADMIN_EMAILS.includes((user?.email ?? "").toLowerCase());
    return {
      user,
      profile,
      loading,
      isAdmin,
      displayName:
        profile?.nombre?.trim() || user?.displayName?.trim() || "Cliente",
      signIn,
      signUp,
      signOutUser,
      saveProfile,
      resetPassword,
    };
  }, [
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOutUser,
    saveProfile,
    resetPassword,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}
