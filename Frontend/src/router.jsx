import { createBrowserRouter } from "react-router";
import MainLayout from "./Layouts/MainLayout";
import LogIn from "./pages/LogIn";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <LogIn/>
      },
    ],
  },
]);

export default router;