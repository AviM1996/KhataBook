import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {Link} from "@mui/material";
import { login } from "../../firebase/auth.service";
import styles from "./SignIn.module.css";


export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
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
    setError("");
    setLoading(true);

    try {
      const res = await login(email, password);
      console.log("LOGIN SUCCESS UID:", res.user.uid);

      navigate(from, { replace: true });
    } catch (err) {
      console.error("LOGIN ERROR 👉", err);
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

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
            required
          />

          <div className={styles.passwordWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={handlePasswordChange}
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
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <footer>© 2026 LedgerFlow</footer>
      </div>
    </div>
  );
}
