// context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if the user is already logged in via localStorage
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user_info');
    
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        setRole(parsedUser.role || "admin");
      } catch {
        // Invalid JSON in localStorage, clear it
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_info');
      }
    }
    setLoading(false);
  }, []);

  // Call this from useLogin after a successful API login
  function loginUser(userData, authToken) {
    setToken(authToken);
    setUser(userData);
    setRole(userData.role || "admin");
  }

  // Call this from useLogout
  function logoutUser() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    setToken(null);
    setUser(null);
    setRole(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, role, loading, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
