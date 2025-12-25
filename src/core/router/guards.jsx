import RequireAuth from './RequireAuth';

export const applyGuards = (routes) =>
  routes.map((route) => {
    if (route.meta?.guard === 'auth') {
      return {
        ...route,
        element: <RequireAuth>{route.element}</RequireAuth>,
      };
    }
    return route;
  });
