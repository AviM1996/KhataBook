import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

/**
 * Auth Context
 */
const AuthContext = createContext(null);

/**
 * Auth Provider (ROOT LEVEL)
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);     // firebase user
  const [role, setRole] = useState(null);     // admin | subadmin | null
  const [loading, setLoading] = useState(true); // auth resolving

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // 🔒 lock UI during auth change
      setLoading(true);

      // ❌ not logged in
      if (!firebaseUser) {
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }

      // ✅ logged in
      setUser(firebaseUser);

      try {
        // fetch role from firestore
        const snap = await getDoc(
          doc(db, "users", firebaseUser.uid)
        );

        if (snap.exists()) {
          setRole(snap.data().role || null);
        } else {
          setRole(null);
        }
      } catch (error) {
        console.error("[AuthContext] role fetch failed", error);
        setRole(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth Hook
 */
export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return ctx;
}
