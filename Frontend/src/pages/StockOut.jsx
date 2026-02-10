import { useEffect, useMemo, useState } from "react";
import { FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import axios from "axios";

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

const DEFAULT_API_BASE = "http://localhost:4000/api";
const WAREHOUSES = ["Warehouse A", "Warehouse B", "Warehouse C", "Warehouse D"];

const StockOut = () => {
  const token = localStorage.getItem("authToken") || "";
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);
  const [formData, setFormData] = useState({
    warehouse: "",
    productId: "",
    quantity: "",
    reason: "",
    reference: "",
    notes: "",
  });

  const [products, setProducts] = useState([]);
  const [productSearchInput, setProductSearchInput] = useState("");
  const [productSearch, setProductSearch] = useState("");

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const limit = 100;
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("limit", String(limit));
    if (productSearch) params.set("search", productSearch);
    return params.toString();
  }, [limit, productSearch]);

  useEffect(() => {
    let cancelled = false;
    const fetchProducts = async () => {
      setLoading(true);
      setErrors((prev) => ({ ...prev, submit: undefined }));
      try {
        const res = await axios.get(`${DEFAULT_API_BASE}/products?${queryParams}`, { headers });
        if (cancelled) return;
        if (!res?.data?.success) {
          throw new Error(res?.data?.message || "Failed to load products");
        }
        setProducts(res.data.data || []);
      } catch (err) {
        if (cancelled) return;
        const message =
          err?.response?.data?.message || err?.message || "Failed to load products";
        setErrors({ submit: message });
        setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProducts();
    return () => {
      cancelled = true;
    };
  }, [queryParams]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.warehouse) newErrors.warehouse = "Warehouse is required";
    if (!formData.productId)
      newErrors.productId = "Please select a product";
    if (!formData.quantity || formData.quantity <= 0)
      newErrors.quantity = "Quantity must be greater than 0";
    if (!formData.reason)
      newErrors.reason = "Reason is required";

    const selectedProduct = products.find((p) => p._id === formData.productId);
    if (selectedProduct && Number(formData.quantity) > (selectedProduct.stock ?? 0)) {
      newErrors.quantity = `Quantity cannot exceed available stock (${selectedProduct.stock ?? 0})`;
    }

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
      const quantity = parseInt(formData.quantity, 10);
      const res = await axios.post(
        `${DEFAULT_API_BASE}/products/${formData.productId}/stock-out`,
        { quantity },
        { headers }
      );

      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Failed to reduce stock");
      }

      setFormData({
        warehouse: "",
        productId: "",
        quantity: "",
        reason: "",
        reference: "",
        notes: "",
      });

      setProductSearchInput("");
      setProductSearch("");

      setSuccessMessage("Stock reduced successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);

      const refresh = await axios.get(`${DEFAULT_API_BASE}/products?${queryParams}`, { headers });
      if (refresh?.data?.success) setProducts(refresh.data.data || []);
    } catch (error) {
      const message =
        error?.response?.data?.message || error?.message || "Failed to reduce stock";
      setErrors({ submit: message });
    } finally {
      setLoading(false);
    }
  };

  const getSelectedProduct = () => {
    return products.find((p) => p._id === formData.productId);
  };

  const selectedProduct = getSelectedProduct();
  const productsForWarehouse = formData.warehouse
    ? products.filter((p) => p.warehouse === formData.warehouse)
    : [];
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
            {/* Warehouse */}
            <div>
              <label htmlFor="warehouse" className={labelClasses}>
                Warehouse <span className="text-red-500">*</span>
              </label>
              <select
                id="warehouse"
                name="warehouse"
                value={formData.warehouse}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    warehouse: value,
                    productId: "",
                  }));
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.warehouse;
                    delete next.productId;
                    return next;
                  });
                }}
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

            {/* Product Search */}
            <div>
              <label htmlFor="productSearch" className={labelClasses}>
                Find Product
              </label>
              <div className="flex gap-2">
                <input
                  id="productSearch"
                  type="text"
                  value={productSearchInput}
                  onChange={(e) => setProductSearchInput(e.target.value)}
                  placeholder="Search by name or SKU"
                  className={inputClasses}
                  disabled={loading || !formData.warehouse}
                />
                <button
                  type="button"
                  disabled={loading || !formData.warehouse}
                  onClick={() => {
                    setProductSearch(productSearchInput.trim());
                    setFormData((prev) => ({ ...prev, productId: "" }));
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.productId;
                      return next;
                    });
                  }}
                  className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Search
                </button>
              </div>
              {!formData.warehouse && (
                <p className="text-sm text-gray-500 mt-1">
                  Select a warehouse to search products.
                </p>
              )}
            </div>

            {/* Product Selection */}
            <div>
              <label htmlFor="productId" className={labelClasses}>
                Select Product <span className="text-red-500">*</span>
              </label>
              <select
                id="productId"
                name="productId"
                value={formData.productId}
                onChange={handleChange}
                className={inputClasses}
                disabled={loading || !formData.warehouse}
              >
                <option value="">Select a product</option>
                {productsForWarehouse.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>

              {selectedProduct && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
                  <p className="font-medium text-red-900">{selectedProduct.name}</p>
                  <p className="text-red-700">
                    Available Stock: {selectedProduct.stock ?? 0} {selectedProduct.unit}
                  </p>
                  <p className="text-red-700">Warehouse: {selectedProduct.warehouse}</p>
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
                  warehouse: "",
                  productId: "",
                  quantity: "",
                  reason: "",
                  reference: "",
                  notes: "",
                });
                setProductSearchInput("");
                setProductSearch("");
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
    </div>
  );
};

export default StockOut;