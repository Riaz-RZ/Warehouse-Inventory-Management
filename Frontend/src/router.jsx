import { createBrowserRouter } from "react-router-dom";
import LogIn from "./pages/LogIn";
import Dashboard from "./Layouts/Dashboard";
import AddProduct from "./pages/AddProduct";
import LogOut from "./pages/LogOut";
import AllProducts from "./pages/AllProducts";
import StockIn from "./pages/StockIn";
import StockOut from "./pages/StockOut";
import StockTransfer from "./pages/StockTransfer";
import Profile from "./pages/Profile";

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
        element: <AddProduct />,
      },
      {
        path: "/dashboard/allproducts",
        element: <AllProducts />,
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
