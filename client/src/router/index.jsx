import { authRoutes } from "./pageRoutes/authRoutes";
import { dashboardRoutes } from "./pageRoutes/dashboardRoutes";
import { ledgerRoutes } from "./pageRoutes/ledgerRoutes";
import { masterRoutes } from "./pageRoutes/masterRoutes";
import { transactionsRoutes } from "./pageRoutes/transactionsRoutes";
import { applyMeta } from "./routeMeta";

const rawRoutes = [
  ...authRoutes,
  ...dashboardRoutes,
  ...ledgerRoutes,
  ...masterRoutes,
  ...transactionsRoutes,
];

export const routes = applyMeta(rawRoutes);