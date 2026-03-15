import { useNavigate } from "react-router-dom";
import { logout } from "../api/auth";
import { useAuth } from "../context/AuthContext";

export function useLogout() {
  const navigate = useNavigate();
  const { logoutUser } = useAuth();

  return async function handleLogout() {
    await logout();
    logoutUser();
    navigate("/login", { replace: true });
  };
}
