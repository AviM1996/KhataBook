import { lazy } from "react";
const TransactionsListPage = lazy(() => import("../../pages/transactions/TransactionsListPage"));

export const transactionsRoutes = [
  {
    path: "/transactions",
    element: <TransactionsListPage />
  }
];
