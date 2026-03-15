import { Routes, Route } from "react-router-dom";
import { routes } from "./index";
import AuthGuard from "../guards/AuthGuard";
import PublicGuard from "../guards/PublicRoute";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import { LoaderOverlay } from "../components";

export default function AppRouter() {
  const { loading } = useAuth();

  if (loading) {
    return <LoaderOverlay text="Loading application..." />;
  }

  return (
    <Routes>
      {routes.map((route, i) => {
        let element = route.element;

        // Wrap with Layout if not an auth page
        if (route.meta?.layout !== "auth") {
          element = <Layout>{element}</Layout>;
        }

        // Apply Guards
        if (route.meta?.public) {
          element = <PublicGuard>{element}</PublicGuard>;
        } else if (route.meta?.protected) {
          element = <AuthGuard>{element}</AuthGuard>;
        }

        return (
          <Route key={i} path={route.path} element={element} />
        );
      })}
    </Routes>
  );
}