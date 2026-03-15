import UniversalLedgerPage from "../../pages/ledger/UniversalLedgerPage";

export const ledgerRoutes = [
  {
    path: "/ledger",
    element: <UniversalLedgerPage />
  },
  {
    path: "/ledger/:entityType/:entityId",
    element: <UniversalLedgerPage />
  }
];
