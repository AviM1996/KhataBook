import LedgerPage  from "./LedgerPage";

export const ledgerRoutes = [
  {
    path: "/ledger/:id",
    element: <LedgerPage />,
    meta: {
      guard: "auth",
    },
  },
];
