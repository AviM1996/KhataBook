import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Link } from "@mui/material";
import { login } from "../../firebase/auth.service";
import styles from "./SignIn.module.css";
import { BufferIconInline } from "../../components/BufferIcon";
import { useLogin } from "../../backend/hooks/useLogin";

export default function Login() {
  const {
    email,
    password,
    loading,
    error,
    emailValid,
    passwordValid,
    showPassword,
    setShowPassword,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
  } = useLogin();

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.icon}>
            <span className={styles.bar + " " + styles.dark}></span>
            <span className={styles.bar + " " + styles.green}></span>
            <span className={styles.check}></span>
          </div>
          <div>
            <div className={styles.brand}>
              Ledger<span>Flow</span>
            </div>
            <div className={styles.tagline}>Smart Accounting</div>
          </div>
        </div>

        {/* TEXT */}
        <h3>Sign in to your account</h3>
        <p className={styles.sub}>Access your ledger securely</p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={handleEmailChange}
             autoComplete="email" 
            required
          />

          <div className={styles.passwordWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={handlePasswordChange}
               autoComplete="current-password"
              required
            />

            <span
              className={styles.eyeIcon}
              onClick={() => setShowPassword((prev) => !prev)}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          <div className={styles.row}>
            <label>
              <input type="checkbox" />
              Remember me
            </label>
            <Link to="#">Forgot Password</Link>
          </div>

          <button
            type="submit"
            className={styles.signInBtn}
            disabled={loading || !emailValid || !passwordValid}
          >
            {loading ? (
              <>
                <BufferIconInline size="small" color="white" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <footer>© 2026 LedgerFlow</footer>
      </div>
    </div>
  );
}
