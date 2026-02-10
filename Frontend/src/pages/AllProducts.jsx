import { useEffect, useMemo, useState } from "react";
import { FiEdit, FiPlusCircle, FiMinusCircle } from "react-icons/fi";
import PropTypes from "prop-types";
import axios from "axios";

const TABLE_HEADERS = [
  "Name",
  "SKU",
  "Category",
  "Unit",
  "Stock",
  "Warehouse",
  "Actions",
];

const ProductRow = ({ product, onEdit, onAdd, onRemove, canEdit }) => (
  <tr className="hover:bg-gray-50">
    <td className="px-4 py-2">{product.name}</td>
    <td className="px-4 py-2">{product.sku}</td>
    <td className="px-4 py-2">{product.category}</td>
    <td className="px-4 py-2">{product.unit}</td>
    <td className="px-4 py-2 font-semibold text-gray-800">{product.stock ?? 0}</td>
    <td className="px-4 py-2">{product.warehouse}</td>
    <td className="px-4 py-2 flex gap-2">
      {canEdit && (
        <button
          onClick={() => onEdit(product._id)}
          className="text-blue-600 hover:text-blue-800 transition-colors"
          aria-label="Edit product"
          title="Edit"
        >
          <FiEdit />
        </button>
      )}
      <button
        onClick={() => onAdd(product._id)}
        className="text-green-600 hover:text-green-800 transition-colors"
        aria-label="Add stock"
        title="Add Stock"
      >
        <FiPlusCircle />
      </button>
      <button
        onClick={() => onRemove(product._id)}
        className="text-red-600 hover:text-red-800 transition-colors"
        aria-label="Remove stock"
        title="Remove Stock"
      >
        <FiMinusCircle />
      </button>
    </td>
  </tr>
);

ProductRow.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    sku: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    unit: PropTypes.string.isRequired,
    stock: PropTypes.number,
    warehouse: PropTypes.string.isRequired,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  canEdit: PropTypes.bool.isRequired,
};

const DEFAULT_API_BASE = "http://localhost:4000/api";

const getRoleFromStorage = () => {
  const direct = localStorage.getItem("role");
  if (direct) return direct;
  try {
    const admin = JSON.parse(localStorage.getItem("admin") || "null");
    if (admin?.role) return admin.role;
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return user?.role || "";
  } catch {
    return "";
  }
};

const AllProducts = ({
  products: productsProp,
  onEdit,
  onAdd,
  onRemove,
}) => {
  const [products, setProducts] = useState(productsProp || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const [meta, setMeta] = useState({ page: 1, limit, totalItems: 0, totalPages: 1, search: "" });

  const token = localStorage.getItem("authToken") || "";
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);
  const isAdmin = getRoleFromStorage() === "Admin";

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (search) params.set("search", search);
    return params.toString();
  }, [page, limit, search]);

  useEffect(() => {
    if (Array.isArray(productsProp)) {
      setProducts(productsProp);
    }
  }, [productsProp]);

  useEffect(() => {
    if (Array.isArray(productsProp)) return;

    let cancelled = false;
    const fetchProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`${DEFAULT_API_BASE}/products?${queryParams}`, { headers });
        if (cancelled) return;
        if (!res?.data?.success) {
          throw new Error(res?.data?.message || "Failed to load products");
        }
        setProducts(res.data.data || []);
        setMeta(res.data.meta || { page, limit, totalItems: 0, totalPages: 1, search });
      } catch (err) {
        if (cancelled) return;
        const message =
          err?.response?.data?.message || err?.message || "Failed to load products";
        setError(message);
        setProducts([]);
        setMeta({ page, limit, totalItems: 0, totalPages: 1, search });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProducts();
    return () => {
      cancelled = true;
    };
  }, [productsProp, queryParams, page, limit, search]);

  const refresh = async () => {
    if (Array.isArray(productsProp)) return;
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${DEFAULT_API_BASE}/products?${queryParams}`, { headers });
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Failed to load products");
      }
      setProducts(res.data.data || []);
      setMeta(res.data.meta || meta);
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Failed to load products";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (productId) => {
    if (typeof onEdit === "function") {
      return onEdit(productId);
    }

    const existing = products.find((p) => p._id === productId);
    if (!existing) {
      setError("Product not found");
      return;
    }

    const name = window.prompt("Product name", existing.name);
    if (name === null) return;
    const sku = window.prompt("SKU", existing.sku);
    if (sku === null) return;
    const category = window.prompt("Category", existing.category);
    if (category === null) return;
    const unit = window.prompt("Unit", existing.unit);
    if (unit === null) return;
    const warehouse = window.prompt("Warehouse", existing.warehouse);
    if (warehouse === null) return;

    setLoading(true);
    setError("");
    try {
      const res = await axios.patch(
        `${DEFAULT_API_BASE}/products/${productId}`,
        {
          name: String(name).trim(),
          sku: String(sku).trim(),
          category: String(category).trim(),
          unit: String(unit).trim(),
          warehouse: String(warehouse).trim(),
        },
        { headers }
      );
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Failed to update product");
      }
      await refresh();
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Failed to update product";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleStockOut = async (productId) => {
    if (typeof onRemove === "function") {
      return onRemove(productId);
    }

    const quantityStr = window.prompt("Enter quantity to remove", "1");
    if (quantityStr === null) return;
    const quantity = parseInt(String(quantityStr).trim(), 10);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setError("Quantity must be a positive integer");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await axios.post(
        `${DEFAULT_API_BASE}/products/${productId}/stock-out`,
        { quantity },
        { headers }
      );
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Failed to update stock");
      }
      await refresh();
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Failed to update stock";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleStockIn = async (productId) => {
    if (typeof onAdd === "function") {
      return onAdd(productId);
    }

    const quantityStr = window.prompt("Enter quantity to add", "1");
    if (quantityStr === null) return;
    const quantity = parseInt(String(quantityStr).trim(), 10);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setError("Quantity must be a positive integer");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await axios.post(
        `${DEFAULT_API_BASE}/products/${productId}/stock-in`,
        { quantity },
        { headers }
      );
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Failed to update stock");
      }
      await refresh();
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Failed to update stock";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const canPrev = meta.page > 1;
  const canNext = meta.page < meta.totalPages;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <h2 className="text-xl font-semibold">All Products</h2>

        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setSearch(searchInput.trim());
          }}
        >
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, SKU, category, warehouse"
            className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Search
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setSearchInput("");
              setSearch("");
              setPage(1);
            }}
            className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            Clear
          </button>
        </form>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-gray-500 text-center py-8">Loading products...</p>
      ) : products.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No products available.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  {TABLE_HEADERS.map((header) => (
                    <th key={header} className="px-4 py-2 border-b">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <ProductRow
                    key={product._id}
                    product={product}
                    onEdit={handleEdit}
                    onAdd={handleStockIn}
                    onRemove={handleStockOut}
                    canEdit={isAdmin}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-3 mt-4">
            <p className="text-sm text-gray-600">
              Page {meta.page} of {meta.totalPages} • {meta.totalItems} items
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={!canPrev || loading}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <button
                type="button"
                disabled={!canNext || loading}
                onClick={() => setPage((p) => p + 1)}
                className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

AllProducts.propTypes = {
  products: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      sku: PropTypes.string.isRequired,
      category: PropTypes.string.isRequired,
      unit: PropTypes.string.isRequired,
      stock: PropTypes.number,
      warehouse: PropTypes.string.isRequired,
    })
  ),
  onEdit: PropTypes.func,
  onAdd: PropTypes.func,
  onRemove: PropTypes.func,
};

export default AllProducts;