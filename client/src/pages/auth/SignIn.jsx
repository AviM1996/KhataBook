import styles from "./SignIn.module.css";
import { Button,Logo} from "../../components";
import { useLogin } from "../../hooks/useLogin";
import { Link } from "@mui/material";

export default function Login() {
  const {email,password,loading,error,emailValid,passwordValid,showPassword,setShowPassword,handleEmailChange,handlePasswordChange,handleSubmit,} = useLogin();

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Logo/>

        <h3>Sign in to your account</h3>
        <p className={styles.sub}>Access your ledger securely</p>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

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
            <Link href="#">Forgot Password</Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            disabled={!emailValid || !passwordValid}
          >
            Sign In
          </Button>
        </form>

        <footer>© 2026 LedgerFlow</footer>
      </div>
    </div>
  );
}
