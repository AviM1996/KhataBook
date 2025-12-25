import Dashboard from "./dashboard";

export const dashboardRoutes = [
  {
    path: "/dashboard",
    element: <Dashboard />,
    meta: {
      guard: "auth",
    },
  },
];
