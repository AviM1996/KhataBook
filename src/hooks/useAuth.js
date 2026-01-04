import { useEffect, useState } from "react";
import { auth } from "../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      
      if (!u) {
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }

      const tokenResult = await u.getIdTokenResult();
      setUser(u);
      setRole(tokenResult.claims.role || "user");
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return { user, role, loading };
}
