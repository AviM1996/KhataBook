import TransactionsListPage from "./TransactionsListPage";

export const transactionsRoutes = [
  {
    path: "/transactions",
    element: <TransactionsListPage />,
    meta: {
      guard: "auth",
    },
  },
];

