import { FiBox, FiUser } from "react-icons/fi";

const Header = () => {
  return (
    <header className="bg-[#121e31] px-6 py-4 text-white border-b border-gray-700 flex items-center justify-between">
      
      <div className="flex items-center gap-3">
        <FiBox className="text-2xl text-blue-400" />
        <h1 className="text-lg font-semibold">
          Warehouse Inventory Management
        </h1>
      </div>

      <div className="flex items-center gap-2 cursor-pointer hover:text-blue-400 transition">
        <FiUser className="text-xl" />
        <span className="text-sm">Admin</span>
      </div>

    </header>
  );
};

export default Header;
