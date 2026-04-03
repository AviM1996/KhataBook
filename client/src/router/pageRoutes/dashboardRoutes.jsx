import { lazy } from "react";
const Dashboard = lazy(() => import("../../pages/dashboard/dashboard"));

export const dashboardRoutes = [
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
];