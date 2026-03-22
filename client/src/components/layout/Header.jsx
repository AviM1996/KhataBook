import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import Drawer from "./Drawer";
import styles from "./Header.module.css";
import { useLogin } from "../../hooks/useLogin";
import Logo from "../ui/Logo/logo";
import { MenuIcon, SunIcon, MoonIcon, LogoutIcon } from "../ui/Icons/Icons";


export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { handleLogout } = useLogin();

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith("/dashboard")) return "Dashboard";
    if (path.startsWith("/masters")) return "Customers";
    if (path.startsWith("/ledger/")) return "Ledger";
    if (path.startsWith("/ledger-system/customer")) return "Customer Ledger";
    if (path.startsWith("/ledger-system/supplier")) return "Supplier Ledger";
    if (path.startsWith("/transactions")) return "Transactions";
    if (path.startsWith("/edit-profile")) return "Edit Profile";
    // return "KhataBook";
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
            <MenuIcon />
          </button>
          <Logo noMargin />
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
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
          <button
            type="button"
            className={styles.logoutBtn}
            title="Logout"
            onClick={handleLogout}
          >
            <LogoutIcon />
          </button>
        </div>
      </header>

      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
