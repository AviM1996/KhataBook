import { createContext, useContext, useEffect, useState } from "react";
import * as authService from "../api/auth";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await authService.getCurrentUser();
        setUser(data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  function loginUser(userData){
    setUser(userData);
  }

  async function logoutUser() {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
