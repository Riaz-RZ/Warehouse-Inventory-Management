import { createBrowserRouter } from "react-router-dom";
import LogIn from "./pages/LogIn";
import Dashboard from "./Layouts/Dashboard";
import AddProduct from "./pages/AddProduct";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LogIn />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
    children: [
      {
        path: "addproduct",
        element: <AddProduct />,
      },
    ],
  },
]);

export default router;
