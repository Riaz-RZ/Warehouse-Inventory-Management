import { NavLink } from "react-router-dom";
import {
  FiPlusSquare,
  FiBox,
  FiShoppingCart,
  FiBarChart2,
  FiUser,
  FiLogOut,
} from "react-icons/fi";

const Sidebar = () => {
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
    <aside className="bg-[#121e31] h-full w-65 m-2 rounded-lg border border-gray-700 px-3 py-6 overflow-y-auto">
      <ul className="space-y-6">

        {/* PRODUCTS */}
        <li>
          <h2 className="text-gray-200 text-sm font-semibold uppercase tracking-wider px-2">
            Manage Products
          </h2>
          <hr className="my-3 border-gray-600" />

          <NavLink to="/dashboard/addproduct" className={linkClass}>
            <FiPlusSquare className="text-lg" />
            Add Product
          </NavLink>

          <NavLink to="/dashboard/myproducts" className={linkClass}>
            <FiBox className="text-lg" />
            My Products
          </NavLink>
        </li>

        {/* SALES */}
        <li>
          <h2 className="text-gray-200 text-sm font-semibold uppercase tracking-wider px-2">
            Manage Sales
          </h2>
          <hr className="my-3 border-gray-600" />

          <NavLink to="/newsale" className={linkClass}>
            <FiShoppingCart className="text-lg" />
            New Sale
          </NavLink>

          <NavLink to="/viewsales" className={linkClass}>
            <FiBarChart2 className="text-lg" />
            View Sales
          </NavLink>
        </li>

        {/* ACCOUNT */}
        <li>
          <h2 className="text-gray-200 text-sm font-semibold uppercase tracking-wider px-2">
            Manage Account
          </h2>
          <hr className="my-3 border-gray-600" />

          <NavLink to="/profile" className={linkClass}>
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
