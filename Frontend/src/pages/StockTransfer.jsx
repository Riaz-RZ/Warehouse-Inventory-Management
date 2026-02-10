import { useEffect, useMemo, useState } from "react";
import { FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import axios from "axios";

const WAREHOUSES = [
  "Warehouse A",
  "Warehouse B",
  "Warehouse C",
  "Warehouse D",
];

const DEFAULT_API_BASE = "http://localhost:4000/api";

const StockTransfer = () => {
  const token = localStorage.getItem("authToken") || "";
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);
  const [formData, setFormData] = useState({
    productId: "",
    quantity: "",
    fromWarehouse: "",
    toWarehouse: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [products, setProducts] = useState([]);
  const [productSearchInput, setProductSearchInput] = useState("");
  const [productSearch, setProductSearch] = useState("");

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

    if (!formData.productId)
      newErrors.productId = "Please select a product";
    if (!formData.quantity || formData.quantity <= 0)
      newErrors.quantity = "Quantity must be greater than 0";
    if (!formData.fromWarehouse)
      newErrors.fromWarehouse = "Source warehouse is required";
    if (!formData.toWarehouse)
      newErrors.toWarehouse = "Destination warehouse is required";
    if (formData.fromWarehouse === formData.toWarehouse)
      newErrors.toWarehouse = "Source and destination must be different";

    const selectedProduct = products.find((p) => p._id === formData.productId);
    if (selectedProduct && Number(formData.quantity) > (selectedProduct.stock ?? 0)) {
      newErrors.quantity = `Quantity cannot exceed available stock (${selectedProduct.stock ?? 0})`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "fromWarehouse") {
        next.productId = "";
        next.toWarehouse = "";
      }
      if (name === "toWarehouse") {
        // no-op
      }
      return next;
    });

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
        `${DEFAULT_API_BASE}/products/transfer`,
        {
          productId: formData.productId,
          quantity,
          fromWarehouse: formData.fromWarehouse,
          toWarehouse: formData.toWarehouse,
          notes: formData.notes,
        },
        { headers }
      );

      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Failed to transfer stock");
      }

      setFormData({
        productId: "",
        quantity: "",
        fromWarehouse: "",
        toWarehouse: "",
        notes: "",
      });

      setProductSearchInput("");
      setProductSearch("");

      setSuccessMessage("Stock transferred successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);

      const refresh = await axios.get(`${DEFAULT_API_BASE}/products?${queryParams}`, { headers });
      if (refresh?.data?.success) setProducts(refresh.data.data || []);
    } catch (error) {
      const message =
        error?.response?.data?.message || error?.message || "Failed to transfer stock";
      setErrors({ submit: message });
    } finally {
      setLoading(false);
    }
  };

  const getSelectedProduct = () => {
    return products.find((p) => p._id === formData.productId);
  };

  const selectedProduct = getSelectedProduct();
  const productsForFromWarehouse = formData.fromWarehouse
    ? products.filter((p) => p.warehouse === formData.fromWarehouse)
    : [];

  const toWarehouseOptions = formData.fromWarehouse
    ? WAREHOUSES.filter((w) => w !== formData.fromWarehouse)
    : WAREHOUSES;

  const inputClasses =
    "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition";
  const labelClasses = "block text-sm font-medium text-gray-700 mb-2";

  return (
    <div className="space-y-6">
      {/* Form Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-semibold mb-6">Stock Transfer</h2>

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
            {/* From Warehouse */}
            <div>
              <label htmlFor="fromWarehouse" className={labelClasses}>
                From Warehouse <span className="text-red-500">*</span>
              </label>
              <select
                id="fromWarehouse"
                name="fromWarehouse"
                value={formData.fromWarehouse}
                onChange={handleChange}
                className={inputClasses}
                disabled={loading}
              >
                <option value="">Select source warehouse</option>
                {WAREHOUSES.map((warehouse) => (
                  <option key={warehouse} value={warehouse}>
                    {warehouse}
                  </option>
                ))}
              </select>
              {errors.fromWarehouse && (
                <p className="text-red-500 text-sm mt-1">{errors.fromWarehouse}</p>
              )}
            </div>

            {/* Search */}
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
                  disabled={loading || !formData.fromWarehouse}
                />
                <button
                  type="button"
                  disabled={loading || !formData.fromWarehouse}
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
              {!formData.fromWarehouse && (
                <p className="text-sm text-gray-500 mt-1">
                  Select a source warehouse first.
                </p>
              )}
            </div>

            {/* Product Selection */}
            <div>
              <label htmlFor="productId" className={labelClasses}>
                Product <span className="text-red-500">*</span>
              </label>
              <select
                id="productId"
                name="productId"
                value={formData.productId}
                onChange={handleChange}
                className={inputClasses}
                disabled={loading || !formData.fromWarehouse}
              >
                <option value="">Select a product</option>
                {productsForFromWarehouse.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>

              {selectedProduct && (
                <div className="mt-2 p-3 bg-purple-50 border border-purple-200 rounded-lg text-sm">
                  <p className="font-medium text-purple-900">
                    {selectedProduct.name}
                  </p>
                  <p className="text-purple-700">
                    Current Location: {selectedProduct.warehouse}
                  </p>
                  <p className="text-purple-700">
                    Available Stock: {selectedProduct.stock ?? 0} {selectedProduct.unit}
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
                placeholder="Enter transfer quantity"
                min="1"
                className={inputClasses}
                disabled={loading}
              />
              {errors.quantity && (
                <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
              )}
            </div>

            {/* To Warehouse */}
            <div>
              <label htmlFor="toWarehouse" className={labelClasses}>
                To Warehouse <span className="text-red-500">*</span>
              </label>
              <select
                id="toWarehouse"
                name="toWarehouse"
                value={formData.toWarehouse}
                onChange={handleChange}
                className={inputClasses}
                disabled={loading || !formData.fromWarehouse}
              >
                <option value="">Select destination warehouse</option>
                {toWarehouseOptions.map((warehouse) => (
                  <option key={warehouse} value={warehouse}>
                    {warehouse}
                  </option>
                ))}
              </select>
              {errors.toWarehouse && (
                <p className="text-red-500 text-sm mt-1">{errors.toWarehouse}</p>
              )}
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
                placeholder="e.g., Stock rebalancing, emergency request"
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
              className="flex-1 bg-purple-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "Transferring Stock..." : "Transfer Stock"}
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData({
                  productId: "",
                  quantity: "",
                  fromWarehouse: "",
                  toWarehouse: "",
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

export default StockTransfer;