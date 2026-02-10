import { Navigate, createBrowserRouter } from "react-router-dom";
import LogIn from "./pages/LogIn";
import Dashboard from "./Layouts/Dashboard";
import AddProduct from "./pages/AddProduct";
import LogOut from "./pages/LogOut";
import AllProducts from "./pages/AllProducts";
import StockIn from "./pages/StockIn";
import StockOut from "./pages/StockOut";
import StockTransfer from "./pages/StockTransfer";
import Profile from "./pages/Profile";
import ManageUsers from "./pages/ManageUsers";

const getRoleFromStorage = () => {
  const direct = localStorage.getItem("role");
  if (direct) return direct;
  try {
    const admin = JSON.parse(localStorage.getItem("admin") || "null");
    if (admin?.role) return admin.role;
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return user?.role || "";
  } catch {
    return "";
  }
};

const RequireAdmin = ({ children }) => {
  const role = getRoleFromStorage();
  if (role !== "Admin") return <Navigate to="/dashboard/stockin" replace />;
  return children;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <LogIn />,
  },
  {
    path: "/logout",
    element: <LogOut />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
    children: [
      {
        path: "/dashboard/addproduct",
        element: (
          <RequireAdmin>
            <AddProduct />
          </RequireAdmin>
        ),
      },
      {
        path: "/dashboard/allproducts",
        element: <AllProducts />,
      },
      {
        path: "/dashboard/manage-users",
        element: (
          <RequireAdmin>
            <ManageUsers />
          </RequireAdmin>
        ),
      },
      {
        path: "/dashboard/stockin",
        element: <StockIn />,
      },
      {
        path: "/dashboard/stockout",
        element: <StockOut />,
      },
      {
        path: "/dashboard/stocktransfer",
        element: <StockTransfer />,
      },
      {
        path: "/dashboard/profile",
        element: <Profile />,
      },
    ],
  },
]);

export default router;
