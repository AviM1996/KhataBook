import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  MdLibraryBooks,
  MdDashboard,
  MdOutlinePeopleAlt,
  MdOutlineClose 
} from "react-icons/md";
import { FaHandshake } from "react-icons/fa";
import styles from "./Drawer.module.css";

export default function Drawer({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: <MdDashboard />,
    },
    {
      path: "/masters/customer",
      label: "Customers",
      icon: <MdOutlinePeopleAlt />,
    },
    {
      path: "/masters/supplier",
      label: "Suppliers",
      icon: <FaHandshake />,
    },
    {
      path: "/ledger",
      label: "Ledger Section",
      icon: <MdLibraryBooks />,
    },
  ];

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  const isActive = (path) => {
    if (!path) return false;
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {isOpen && <div className={styles.backdrop} onClick={onClose} />}

      {/* Drawer */}
      <div className={`${styles.drawer} ${isOpen ? styles.open : ""}`}>
        <div className={styles.drawerHeader}>
          <h3>Menu</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <MdOutlineClose />
          </button>
        </div>

        <nav className={styles.nav}>
          {menuItems.map((item) => (
            <button
              key={item.path}
              className={`${styles.menuItem} ${isActive(item.path) ? styles.active : ""}`}
              onClick={() => handleNavigate(item.path)}
            >
              <span className={styles.icon}>{item.icon}</span>
              <span className={styles.label}>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
