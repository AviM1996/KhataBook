import CustomerPage from "../../pages/masters/CustomerPage";
import SupplierPage from "../../pages/masters/SupplierPage";
import AddCustomerPage from "../../pages/masters/AddCustomerPage";
import AddSupplierPage from "../../pages/masters/AddSupplierPage";
import EditCustomerPage from "../../pages/masters/editCustomerPage";
import EditSupplierPage from "../../pages/masters/EditSupplierPage";

export const masterRoutes = [
  {
    path: "/masters/customer",
    element: <CustomerPage />
  },
  {
    path: "/masters/supplier",
    element: <SupplierPage />
  },
  {
    path: "/masters/customer/add",
    element: <AddCustomerPage />
  },
  {
    path: "/masters/supplier/add",
    element: <AddSupplierPage />
  },
  {
    path: "/masters/customer/edit/:id",
    element: <EditCustomerPage />
  },
  {
    path: "/masters/supplier/edit/:id",
    element: <EditSupplierPage />
  }
];
