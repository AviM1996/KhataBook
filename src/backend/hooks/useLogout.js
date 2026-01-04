import { useNavigate } from "react-router-dom";
import { logout } from "../api/auth.api";

export function useLogout() {
  const navigate = useNavigate();

  return async function handleLogout() {
    await logout();

    navigate("/login", {
      replace: true,
    });
  };
}
