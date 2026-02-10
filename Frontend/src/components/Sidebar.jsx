import { NavLink } from "react-router-dom";
import {
  FiPlusSquare,
  FiBox,
  FiShoppingCart,
  FiBarChart2,
  FiUser,
  FiLogOut,
  FiArrowDownCircle,
  FiArrowUpCircle,
  FiShuffle,
  FiUsers,
} from "react-icons/fi";

const Sidebar = () => {
  const role = localStorage.getItem("role") || (() => {
    try {
      const admin = JSON.parse(localStorage.getItem("admin") || "null");
      if (admin?.role) return admin.role;
      const user = JSON.parse(localStorage.getItem("user") || "null");
      return user?.role || "";
    } catch {
      return "";
    }
  })();
  const isAdmin = role === "Admin";

  const linkClass = ({ isActive }) =>
    `
    group flex items-center gap-3 px-4 py-2 text-[15px] rounded-md transition-all
    ${
      isActive
        ? "bg-gray-700 text-white border-l-4 border-blue-500"
        : "text-gray-300 hover:bg-gray-700 hover:text-white"
    }
    `;

  return (
    <aside className="bg-[#121e31] w-65 m-2 rounded-lg border border-gray-700 px-3 py-6 overflow-y-auto">
      <ul className="space-y-6">

        {/* PRODUCTS */}
        <li>
          <h2 className="text-gray-200 text-sm font-semibold uppercase tracking-wider px-2">
            Manage Products
          </h2>
          <hr className="my-3 border-gray-600" />

          {isAdmin && (
            <NavLink to="/dashboard/addproduct" className={linkClass}>
              <FiPlusSquare className="text-lg" />
              Add Product
            </NavLink>
          )}

          <NavLink to="/dashboard/allproducts" className={linkClass}>
            <FiBox className="text-lg" />
            All Products
          </NavLink>
        </li>

        {/* USERS */}
        {isAdmin && (
          <li>
            <h2 className="text-gray-200 text-sm font-semibold uppercase tracking-wider px-2">
              Manage Users
            </h2>
            <hr className="my-3 border-gray-600" />

            <NavLink to="/dashboard/manage-users" className={linkClass}>
              <FiUsers className="text-lg" />
              Manage Users
            </NavLink>
          </li>
        )}

        {/* Stock */}
        <li>
          <h2 className="text-gray-200 text-sm font-semibold uppercase tracking-wider px-2">
            Manage Stock
          </h2>
          <hr className="my-3 border-gray-600" />

          <NavLink to="/dashboard/stockin" className={linkClass}>
  <FiArrowDownCircle className="text-lg" />
  Stock In
</NavLink>

<NavLink to="/dashboard/stockout" className={linkClass}>
  <FiArrowUpCircle className="text-lg" />
  Stock Out
</NavLink>

<NavLink to="/dashboard/stocktransfer" className={linkClass}>
  <FiShuffle className="text-lg" />
  Stock Transfer
</NavLink>

        </li>

        {/* ACCOUNT */}
        <li>
          <h2 className="text-gray-200 text-sm font-semibold uppercase tracking-wider px-2">
            Manage Account
          </h2>
          <hr className="my-3 border-gray-600" />

          <NavLink to="/dashboard/profile" className={linkClass}>
            <FiUser className="text-lg" />
            Profile
          </NavLink>

          <NavLink to="/logout" className={linkClass}>
            <FiLogOut className="text-lg" />
            Logout
          </NavLink>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
