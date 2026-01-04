import ProtectedRoute from "../guards/ProtectedRoute";
import PublicRoute from "../guards/PublicRoute";
import RoleGuard from "../guards/RoleGuard";

export const applyGuards = (routes) =>
  routes.map((route) => {
    let element = route.element;

    // 🔓 public route (login)
    // if (route.meta?.public) {
    //   element = <PublicRoute>{element}</PublicRoute>;
    // }

    // 🔐 protected route
    if (route.meta?.protected) {
      element = <ProtectedRoute>{element}</ProtectedRoute>;
    }

    // 👮 role based
    if (route.meta?.roles?.length) {
      element = (
        <RoleGuard allow={route.meta.roles}>
          {element}
        </RoleGuard>
      );
    }

    return { ...route, element };
  });
