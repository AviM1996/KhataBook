import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./Drawer.module.css";
import { DashboardIcon, CustomersIcon, CloseIcon } from "./ui/Icons/Icons";

export default function Drawer({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleSubmenu = (menuLabel) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuLabel]: !prev[menuLabel],
    }));
  };

  const menuItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: <DashboardIcon />,
    },
    {
      path: "/masters",
      label: "Master Section",
      icon: <CustomersIcon />,
    },
    {
      path: "/ledger",
      label: "Ledger Section",
      icon: <span style={{fontSize: "1.2rem"}}>📒</span>,
    }
  ];

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  const isActive = (path) => {
    if (!path) return false;
    return location.pathname.startsWith(path);
  };

  const isSubActive = (subItems) => {
    return subItems.some((s) => isActive(s.path));
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className={styles.backdrop} onClick={onClose} />
      )}

      {/* Drawer */}
      <div className={`${styles.drawer} ${isOpen ? styles.open : ""}`}>
        <div className={styles.drawerHeader}>
          <h3>Menu</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <nav className={styles.nav}>
          {menuItems.map((item) => {
            if (item.subItems) {
              const menuOpen = expandedMenus[item.label] || isSubActive(item.subItems);
              const parentActive = isSubActive(item.subItems);

              return (
                <div key={item.label} className={styles.menuGroup}>
                  <button
                    className={`${styles.menuItem} ${parentActive ? styles.active : ""}`}
                    onClick={() => toggleSubmenu(item.label)}
                  >
                    <span className={styles.icon}>{item.icon}</span>
                    <span className={styles.label}>{item.label}</span>
                    <span className={`${styles.arrow} ${menuOpen ? styles.arrowOpen : ""}`}>
                      ▼
                    </span>
                  </button>
                  
                  {/* Collapsible Submenu */}
                  {menuOpen && (
                    <div className={styles.submenu}>
                      {item.subItems.map((sub) => (
                        <button
                          key={sub.path}
                          className={`${styles.submenuItem} ${isActive(sub.path) ? styles.active : ""}`}
                          onClick={() => handleNavigate(sub.path)}
                        >
                          <span className={styles.icon}>{sub.icon}</span>
                          <span className={styles.label}>{sub.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <button
                key={item.path}
                className={`${styles.menuItem} ${isActive(item.path) ? styles.active : ""}`}
                onClick={() => handleNavigate(item.path)}
              >
                <span className={styles.icon}>{item.icon}</span>
                <span className={styles.label}>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
}

