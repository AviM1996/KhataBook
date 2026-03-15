import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PublicGuard({ children }) {
  const { token } = useAuth();

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}