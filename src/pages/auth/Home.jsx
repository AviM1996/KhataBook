import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Home.module.css";

export default function Home() {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate("/login");
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
          <div className={styles.branding}>
            <div className={styles.brand}>
              Ledger<span>Flow</span>
            </div>
            <div className={styles.tagline}>Smart Accounting</div>
          </div>
        </div>

        <h2>Welcome to LedgerFlow</h2>
        <p className={styles.sub}>
          Secure, simple and intelligent accounting for your business
        </p>

        <div className={styles.actions}>
          <button
            className={styles.primaryBtn}
            onClick={handleContinue}
            type="button"
          >
            Sign in with password
          </button>
        </div>

        <footer>© 2026 LedgerFlow</footer>
      </div>
    </div>
  );
}
