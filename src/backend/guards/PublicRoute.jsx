import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

export default function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  // ✅ already logged in → redirect away from login
  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}
