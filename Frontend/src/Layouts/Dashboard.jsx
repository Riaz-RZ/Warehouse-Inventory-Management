import Header from "../components/Header";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";
import useCheckAuth from "../hooks/useCheckAuth";

const Dashboard = () => {
  useCheckAuth();

  return (
    <div className="h-screen flex flex-col">
      <Header />

      <div className="flex grow overflow-hidden">
        <Sidebar />
        <main className="grow p-6 bg-gray-100 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
