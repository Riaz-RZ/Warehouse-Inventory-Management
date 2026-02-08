import { createBrowserRouter } from "react-router-dom";
import LogIn from "./pages/LogIn";
import Dashboard from "./Layouts/Dashboard";
import AddProduct from "./pages/AddProduct";
import LogOut from "./pages/LogOut";

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
    ],
  },
]);

export default router;
