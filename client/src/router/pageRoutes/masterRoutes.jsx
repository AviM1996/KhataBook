import { lazy } from "react";
const CustomerPage = lazy(() => import("../../pages/masters/CustomerPage"));
const SupplierPage = lazy(() => import("../../pages/masters/SupplierPage"));
const AddCustomerPage = lazy(() => import("../../pages/masters/AddCustomerPage"));
const AddSupplierPage = lazy(() => import("../../pages/masters/AddSupplierPage"));
const EditCustomerPage = lazy(() => import("../../pages/masters/editCustomerPage"));
const EditSupplierPage = lazy(() => import("../../pages/masters/EditSupplierPage"));

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
