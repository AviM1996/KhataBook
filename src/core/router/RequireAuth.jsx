import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import BufferIcon from "../../components/BufferIcon";

export default function RequireAuth({ children }) {
  const { user,role, loading } = useAuth();
  const location = useLocation();

  // ⏳ Firebase auth state now loading
  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0f172a, #020617)"
      }}>
        <BufferIcon size="large" color="green" text="Loading..." />
      </div>
    );
  }

  // 🔒 Not logged in
 if (!user) return <Navigate to="/login" />;

  if (role !== "admin" && role !== "subadmin") {
    return <div> Access Denied</div>;
  }

  return children;
}
