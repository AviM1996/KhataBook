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

  function logoutUser() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_info");
    setToken(null);
    setUser(null);
    setRole(null);
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
