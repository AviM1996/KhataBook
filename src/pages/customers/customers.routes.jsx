import Customers from "./CustomersPage";
import AddCustomer from "./AddCustomerPage";

export const customersRoutes = [
  {
    path: "/customers",
    element: <Customers />,
    meta: {
      guard: "auth",
    },
  },
  {
    path: "/customers/add",
    element: <AddCustomer />,
    meta: {
      guard: "auth",
    },
  }
];
