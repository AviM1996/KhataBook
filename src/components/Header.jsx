import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Header.module.css";

export default function Header() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false); // future use

  const handleLogout = () => {
    localStorage.removeItem("ACCESS_TOKEN");
    navigate("/", { replace: true });
  };

  return (
    <header className={styles.appHeader}>
      {/* LEFT */}
      <div className={styles.headerLeft}>
        <div className={styles.logo}>
          <div className={styles.icon}>
            <span className={`${styles.bar} ${styles.dark}`} />
            <span className={`${styles.bar} ${styles.green}`} />
            <span className={styles.check} />
          </div>
          <div>
            <div className={styles.brand}>
              Ledger<span>Flow</span>
            </div>
            <div className={styles.tagline}>Smart Accounting</div>
          </div>
        </div>
      </div>

      {/* CENTER */}
      <div className={styles.headerCenter}>
        <h2 className={styles.pageTitle}>Dashboard</h2>
        <span className={styles.activeIndicator}></span>
      </div>

      {/* RIGHT */}
      <div className={styles.headerRight}>
        <button
          type="button"
          className={styles.logoutBtn}
          title="Logout"
          onClick={handleLogout}
        >
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M16 17l5-5-5-5M21 12H9" />
            <path d="M13 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8" />
          </svg>
        </button>
      </div>
    </header>
  );
}
