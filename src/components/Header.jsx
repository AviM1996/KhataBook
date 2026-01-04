import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import Drawer from "./Drawer";
import styles from "./Header.module.css";
import { useLogout } from "../backend/hooks/useLogout";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const logout = useLogout();

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith("/dashboard")) return "Dashboard";
    if (path.startsWith("/customers")) return "Customers";
    if (path.startsWith("/ledger")) return "Ledger";
    if (path.startsWith("/sms")) return "SMS";
    if (path.startsWith("/transactions")) return "Transactions";
    return "Dashboard";
  };

  return (
    <>
      <header className={styles.appHeader}>
        {/* LEFT */}
        <div className={styles.headerLeft}>
          <button
            className={styles.menuBtn}
            onClick={() => setDrawerOpen(true)}
            title="Open menu"
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
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
          <h2 className={styles.pageTitle}>{getPageTitle()}</h2>
          <span className={styles.activeIndicator}></span>
        </div>

        {/* RIGHT */}
        <div className={styles.headerRight}>
          <button
            type="button"
            className={styles.themeToggle}
            title={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
            onClick={toggleTheme}
          >
            {theme === "dark" ? (
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
          <button
            type="button"
            className={styles.logoutBtn}
            title="Logout"
            onClick={logout}
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

      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
