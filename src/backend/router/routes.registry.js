import { authRoutes } from '../../pages/auth/auth.routes';
import { customersRoutes } from '../../pages/customers/customers.routes';
import { dashboardRoutes } from '../../pages/dashboard/dashboard.routes';
import { ledgerRoutes } from '../../pages/ledger/ledger.routes';
import { transactionsRoutes } from '../../pages/transactions/transactions.routes';
import { smsRoutes } from '../../pages/sms/sms.routes';

export const appRoutes = [
  ...authRoutes,
  ...customersRoutes,
  ...dashboardRoutes,
  ...ledgerRoutes,
  ...transactionsRoutes,
  ...smsRoutes
];
