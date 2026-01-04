import Customers from "./CustomersPage";
import AddCustomer from "./AddCustomerPage";
import EditCustomer from "./editCustomerPage";

export const customersRoutes = [
  {
    path: "/customers",
    element: <Customers />,
    meta: {
      guard: "auth",
      public: true,
    },
  },
  {
    path: "/customers/add",
    element: <AddCustomer />,
    meta: {
      guard: "auth",
    },
  },
  {
    path: "/customers/edit/:id",
    element: <EditCustomer />,
    meta: {
      guard: "auth",
    },
  }
];
