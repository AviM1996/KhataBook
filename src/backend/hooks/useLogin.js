import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { login } from "../api/auth.api";

/**
 * useLogin Hook
 * -----------------------
 * Handles:
 *  - email/password state
 *  - validation
 *  - loading & error
 *  - redirect after login
 */
export function useLogin() {
  const navigate = useNavigate();
  const location = useLocation();

  // where to redirect after login
  const from = location.state?.from || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [emailValid, setEmailValid] = useState(null);
  const [passwordValid, setPasswordValid] = useState(null);

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);

    const isValid =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    setEmailValid(value ? isValid : null);
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordValid(value ? value.length >= 6 : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);

      navigate(from, { replace: true });
    } catch (err) {
    //   console.error("[useLogin] login failed", err);
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

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
  };
}
