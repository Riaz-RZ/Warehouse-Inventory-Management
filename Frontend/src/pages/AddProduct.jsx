import { useState } from "react";
import PropTypes from "prop-types";
import { FiAlertCircle, FiCheckCircle } from "react-icons/fi";

const CATEGORIES = [
  "Electronics",
  "Clothing",
  "Books",
  "Home & Garden",
  "Sports",
  "Toys",
  "Food & Beverage",
  "Other",
];

const UNITS = ["Piece", "Box", "Kg", "Liter", "Meter", "Dozen", "Pack"];

const WAREHOUSES = ["Warehouse A", "Warehouse B", "Warehouse C", "Warehouse D"];

const AddProduct = ({ onSubmit = () => {} }) => {
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    unit: "",
    stock: "",
    minStock: "",
    warehouse: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.sku.trim()) newErrors.sku = "SKU is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.unit) newErrors.unit = "Unit is required";
    if (!formData.stock || formData.stock < 0)
      newErrors.stock = "Stock must be a valid number";
    if (!formData.minStock || formData.minStock < 0)
      newErrors.minStock = "Min stock must be a valid number";
    if (!formData.warehouse) newErrors.warehouse = "Warehouse is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setSuccessMessage("");

    try {
      await onSubmit({
        ...formData,
        stock: parseInt(formData.stock),
        minStock: parseInt(formData.minStock),
      });

      setFormData({
        name: "",
        sku: "",
        category: "",
        unit: "",
        stock: "",
        minStock: "",
        warehouse: "",
      });

      setSuccessMessage("Product added successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrors({ submit: error.message || "Failed to add product" });
    } finally {
      setLoading(false);
    }
  };

  const inputClasses =
    "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";

  const labelClasses = "block text-sm font-medium text-gray-700 mb-2";

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 max-w-2xl">
      <h2 className="text-2xl font-semibold mb-6">Add New Product</h2>

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <FiCheckCircle className="text-green-600 text-xl" />
          <p className="text-green-700">{successMessage}</p>
        </div>
      )}

      {errors.submit && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <FiAlertCircle className="text-red-600 text-xl" />
          <p className="text-red-700">{errors.submit}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Name */}
          <div>
            <label htmlFor="name" className={labelClasses}>
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter product name"
              className={inputClasses}
              disabled={loading}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* SKU */}
          <div>
            <label htmlFor="sku" className={labelClasses}>
              SKU <span className="text-red-500">*</span>
            </label>
            <input
              id="sku"
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              placeholder="e.g., PROD-001"
              className={inputClasses}
              disabled={loading}
            />
            {errors.sku && (
              <p className="text-red-500 text-sm mt-1">{errors.sku}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className={labelClasses}>
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={inputClasses}
              disabled={loading}
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">{errors.category}</p>
            )}
          </div>

          {/* Unit */}
          <div>
            <label htmlFor="unit" className={labelClasses}>
              Unit <span className="text-red-500">*</span>
            </label>
            <select
              id="unit"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              className={inputClasses}
              disabled={loading}
            >
              <option value="">Select a unit</option>
              {UNITS.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
            {errors.unit && (
              <p className="text-red-500 text-sm mt-1">{errors.unit}</p>
            )}
          </div>

          {/* Stock */}
          <div>
            <label htmlFor="stock" className={labelClasses}>
              Stock Quantity <span className="text-red-500">*</span>
            </label>
            <input
              id="stock"
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              placeholder="0"
              min="0"
              className={inputClasses}
              disabled={loading}
            />
            {errors.stock && (
              <p className="text-red-500 text-sm mt-1">{errors.stock}</p>
            )}
          </div>

          {/* Minimum Stock */}
          <div>
            <label htmlFor="minStock" className={labelClasses}>
              Minimum Stock Level <span className="text-red-500">*</span>
            </label>
            <input
              id="minStock"
              type="number"
              name="minStock"
              value={formData.minStock}
              onChange={handleChange}
              placeholder="0"
              min="0"
              className={inputClasses}
              disabled={loading}
            />
            {errors.minStock && (
              <p className="text-red-500 text-sm mt-1">{errors.minStock}</p>
            )}
          </div>

          {/* Warehouse */}
          <div className="md:col-span-2">
            <label htmlFor="warehouse" className={labelClasses}>
              Warehouse <span className="text-red-500">*</span>
            </label>
            <select
              id="warehouse"
              name="warehouse"
              value={formData.warehouse}
              onChange={handleChange}
              className={inputClasses}
              disabled={loading}
            >
              <option value="">Select a warehouse</option>
              {WAREHOUSES.map((wh) => (
                <option key={wh} value={wh}>
                  {wh}
                </option>
              ))}
            </select>
            {errors.warehouse && (
              <p className="text-red-500 text-sm mt-1">{errors.warehouse}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Adding Product..." : "Add Product"}
          </button>
          <button
            type="button"
            onClick={() => {
              setFormData({
                name: "",
                sku: "",
                category: "",
                unit: "",
                stock: "",
                minStock: "",
                warehouse: "",
              });
              setErrors({});
            }}
            disabled={loading}
            className="flex-1 bg-gray-200 text-gray-700 py-2 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

AddProduct.propTypes = {
  onSubmit: PropTypes.func,
};

export default AddProduct;