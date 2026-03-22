import MastersPage from "../../pages/masters/MastersPage";
import AddCustomerPage from "../../pages/masters/AddCustomerPage";
import EditCustomer from "../../pages/masters/editCustomerPage";

export const masterRoutes = [
  {
    path: "/masters",
    element: <MastersPage />
  },
  {
    path: "/masters/add",
    element: <AddCustomerPage />
  },
  {
    path: "/masters/edit/:id",
    element: <EditCustomer />
  }
];
