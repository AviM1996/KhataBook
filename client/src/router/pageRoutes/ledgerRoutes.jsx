import { lazy } from "react";
const UniversalLedgerPage = lazy(() => import("../../pages/ledger/UniversalLedgerPage"));
const DummyLedgerPage = lazy(() => import("../../pages/ledger/DummyLedgerPage"));

export const ledgerRoutes = [
  {
    path: "/ledger",
    element: <UniversalLedgerPage />
  },
  {
    path: "/ledger/dummy",
    element: <UniversalLedgerPage />
  },
  {
    path: "/ledger/:entityType/:entityId",
    element: <UniversalLedgerPage />
  },
  {
    path: "/dummy-ledger",
    element: <DummyLedgerPage />
  }
];
