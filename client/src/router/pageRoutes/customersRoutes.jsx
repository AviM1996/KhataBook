import Customers from "../../pages/customers/CustomersPage";
import AddCustomer from "../../pages/customers/AddCustomerPage";
import EditCustomer from "../../pages/customers/editCustomerPage";

export const customersRoutes = [
  {
    path: "/customers",
    element: <Customers />
  },
  {
    path: "/customers/add",
    element: <AddCustomer />
  },
  {
    path: "/customers/edit/:id",
    element: <EditCustomer />
  }
];