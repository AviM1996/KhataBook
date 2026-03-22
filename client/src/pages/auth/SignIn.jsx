import styles from "./SignIn.module.css";
import { Button,Logo,Footer} from "../../components";
import { useLogin } from "../../hooks/useLogin";
import { Link } from "@mui/material";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function Login() {
  const {email,
    password,
    showPassword,
    rememberMe,
    loading,
    error,
    setShowPassword,
    setRememberMe,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit} = useLogin();

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Logo/>
        <h3>Sign in to your account</h3>
        <p className={styles.sub}>Access your ledger securely</p>

        {error && (<div className={styles.error}>{error}</div>)}

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
            >{showPassword ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>

          <div className={styles.row}>
            <label>
              <input 
              type="checkbox" 
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>

            <Link href="#">Forgot Password</Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            disabled={loading}
          >
            Sign In
          </Button>
        </form>

        <Footer />
      </div>
    </div>
  );
}
