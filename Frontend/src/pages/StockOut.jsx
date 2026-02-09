import { useState } from "react";
import PropTypes from "prop-types";
import { FiCheckCircle, FiAlertCircle, FiTrash2 } from "react-icons/fi";

const STOCK_OUT_REASONS = [
  "Sales",
  "Damaged/Defective",
  "Expired",
  "Return to Supplier",
  "Inventory Adjustment",
  "Loss/Theft",
  "Transfer Out",
  "Other",
];

const StockOut = ({ products = [], onReduceStock = () => {}, transactions = [] }) => {
  const [formData, setFormData] = useState({
    productId: "",
    quantity: "",
    reason: "",
    reference: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.productId)
      newErrors.productId = "Please select a product";
    if (!formData.quantity || formData.quantity <= 0)
      newErrors.quantity = "Quantity must be greater than 0";
    if (!formData.reason)
      newErrors.reason = "Reason is required";

    const selectedProduct = products.find(p => p._id === formData.productId);
    if (selectedProduct && formData.quantity > selectedProduct.stock) {
      newErrors.quantity = `Quantity cannot exceed available stock (${selectedProduct.stock})`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProductSearch = (value) => {
    if (!value) {
      setFilteredProducts([]);
      setShowDropdown(false);
      return;
    }

    const filtered = products.filter(
      (p) =>
        p.name.toLowerCase().includes(value.toLowerCase()) ||
        p.sku.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredProducts(filtered);
    setShowDropdown(true);
  };

  const handleSelectProduct = (product) => {
    setFormData((prev) => ({
      ...prev,
      productId: product._id,
    }));
    setShowDropdown(false);
    setFilteredProducts([]);

    if (errors.productId) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.productId;
        return newErrors;
      });
    }
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
      const selectedProduct = products.find(p => p._id === formData.productId);

      await onReduceStock({
        productId: formData.productId,
        productName: selectedProduct?.name,
        quantity: parseInt(formData.quantity),
        reason: formData.reason,
        reference: formData.reference,
        notes: formData.notes,
        date: new Date().toISOString(),
      });

      setFormData({
        productId: "",
        quantity: "",
        reason: "",
        reference: "",
        notes: "",
      });

      setSuccessMessage("Stock reduced successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrors({ submit: error.message || "Failed to reduce stock" });
    } finally {
      setLoading(false);
    }
  };

  const getSelectedProduct = () => {
    return products.find((p) => p._id === formData.productId);
  };

  const selectedProduct = getSelectedProduct();
  const inputClasses =
    "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition";
  const labelClasses = "block text-sm font-medium text-gray-700 mb-2";

  return (
    <div className="space-y-6">
      {/* Form Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-semibold mb-6">Stock Out</h2>

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
            {/* Product Selection */}
            <div className="relative">
              <label htmlFor="product" className={labelClasses}>
                Product <span className="text-red-500">*</span>
              </label>
              <input
                id="product"
                type="text"
                placeholder="Search product by name or SKU"
                onChange={(e) => handleProductSearch(e.target.value)}
                onFocus={() => setShowDropdown(filteredProducts.length > 0)}
                className={inputClasses}
                disabled={loading}
              />

              {showDropdown && filteredProducts.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-56 overflow-y-auto">
                  {filteredProducts.map((product) => (
                    <button
                      key={product._id}
                      type="button"
                      onClick={() => handleSelectProduct(product)}
                      className="w-full text-left px-4 py-3 hover:bg-red-50 border-b last:border-b-0 transition"
                    >
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-600">
                        SKU: {product.sku} | Stock: {product.stock}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {selectedProduct && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
                  <p className="font-medium text-red-900">
                    {selectedProduct.name}
                  </p>
                  <p className="text-red-700">
                    Available Stock: {selectedProduct.stock} {selectedProduct.unit}
                  </p>
                </div>
              )}

              {errors.productId && (
                <p className="text-red-500 text-sm mt-1">{errors.productId}</p>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label htmlFor="quantity" className={labelClasses}>
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                id="quantity"
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="Enter quantity"
                min="1"
                className={inputClasses}
                disabled={loading}
              />
              {errors.quantity && (
                <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
              )}
            </div>

            {/* Reason */}
            <div>
              <label htmlFor="reason" className={labelClasses}>
                Reason <span className="text-red-500">*</span>
              </label>
              <select
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                className={inputClasses}
                disabled={loading}
              >
                <option value="">Select a reason</option>
                {STOCK_OUT_REASONS.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
              {errors.reason && (
                <p className="text-red-500 text-sm mt-1">{errors.reason}</p>
              )}
            </div>

            {/* Reference */}
            <div>
              <label htmlFor="reference" className={labelClasses}>
                Reference/Receipt No (Optional)
              </label>
              <input
                id="reference"
                type="text"
                name="reference"
                value={formData.reference}
                onChange={handleChange}
                placeholder="e.g., SALE-001, RMA-001"
                className={inputClasses}
                disabled={loading}
              />
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label htmlFor="notes" className={labelClasses}>
                Notes (Optional)
              </label>
              <input
                id="notes"
                type="text"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="e.g., Customer return, damaged goods"
                className={inputClasses}
                disabled={loading}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-red-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "Reducing Stock..." : "Reduce Stock"}
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData({
                  productId: "",
                  quantity: "",
                  reason: "",
                  reference: "",
                  notes: "",
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

      {/* Recent Transactions */}
      {transactions.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold mb-4">Recent Stock Out Transactions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="px-4 py-2 border-b">Product</th>
                  <th className="px-4 py-2 border-b">Quantity</th>
                  <th className="px-4 py-2 border-b">Reason</th>
                  <th className="px-4 py-2 border-b">Reference</th>
                  <th className="px-4 py-2 border-b">Date</th>
                  <th className="px-4 py-2 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{transaction.productName}</td>
                    <td className="px-4 py-2 font-semibold text-red-600">
                      -{transaction.quantity}
                    </td>
                    <td className="px-4 py-2 text-sm">{transaction.reason}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {transaction.reference || "-"}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">
                      <button className="text-red-600 hover:text-red-800 transition-colors">
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

StockOut.propTypes = {
  products: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      sku: PropTypes.string.isRequired,
      stock: PropTypes.number.isRequired,
      unit: PropTypes.string.isRequired,
    })
  ),
  onReduceStock: PropTypes.func,
  transactions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      productName: PropTypes.string.isRequired,
      quantity: PropTypes.number.isRequired,
      reason: PropTypes.string.isRequired,
      reference: PropTypes.string,
      date: PropTypes.string.isRequired,
    })
  ),
};

export default StockOut;