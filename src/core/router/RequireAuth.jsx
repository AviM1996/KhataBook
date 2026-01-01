import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function RequireAuth({ children }) {
  const { user,role, loading } = useAuth();
  const location = useLocation();

  // ⏳ Firebase auth state now loading
  if (loading) {
    return <div>Loading...</div>;
  }

  // 🔒 Not logged in
 if (!user) return <Navigate to="/login" />;

  if (role !== "admin" && role !== "subadmin") {
    return <div> Access Denied</div>;
  }

  return children;
}
