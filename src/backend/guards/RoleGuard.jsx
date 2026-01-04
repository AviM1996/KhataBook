import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

export default function RoleGuard({ allow, children }) {
  const { role, loading } = useAuth();

  if (loading) return null;
  if (!role || !allow.includes(role)) {
    return <Navigate to="/not-authorized" replace />;
  }

  return children;
}
