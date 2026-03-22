import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { login,logout } from "../api/auth";
import { useAuth } from "../context/AuthContext";

export function useLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser,logoutUser } = useAuth();

  const from = location.state?.from?.pathname || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [emailValid, setEmailValid] = useState(null);
  const [passwordValid, setPasswordValid] = useState(null);

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    setEmailValid(value ? isValid : null);
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordValid(value ? value.length >= 6 : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!email || !password) {
      return setError("Email and Password are required");
    }

    if (emailValid === false || passwordValid === false) {
      return setError("Please enter valid credentials");
    }

    setError("");
    setLoading(true);

    try {
      const result = await login(email, password);
      loginUser(result.user);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    logoutUser();
    navigate("/login", { replace: true });
  }

  return {
    email,
    password,
    showPassword,
    rememberMe,
    loading,
    error,
    emailValid,
    passwordValid,
    setShowPassword,
    setRememberMe,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
    handleLogout
  };
}
