import { useNavigate } from "react-router-dom";
import styles from "./Home.module.css";
import { Button,Logo} from "../../components";

export default function Home() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
  };
  const handleRegister = () => {
    navigate("/register");
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Logo />
        <h2>Welcome to LedgerFlow</h2>
        <p className={styles.sub}>
          Secure, simple and intelligent accounting for your business
        </p>

        <div className={styles.actions}>
          <Button
            onClick={handleLogin}
            fullWidth
          >
            Sign in with password
          </Button>
          <Button
            onClick={handleRegister}
            // variant="outline"
            fullWidth
          >
            Register
          </Button>
        </div>

        <footer>© 2026 LedgerFlow</footer>
      </div>
    </div>
  );
}
