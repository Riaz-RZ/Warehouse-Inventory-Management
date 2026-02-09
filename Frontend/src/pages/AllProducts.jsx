import { FiEdit, FiPlusCircle, FiMinusCircle } from "react-icons/fi";
import PropTypes from "prop-types";

const TABLE_HEADERS = [
  "Name",
  "SKU",
  "Category",
  "Unit",
  "Stock",
  "Min Stock",
  "Warehouse",
  "Actions",
];

const getStockStatusClass = (stock, minStock) => {
  return stock <= minStock ? "text-red-600" : "text-gray-800";
};

const ProductRow = ({ product, onEdit, onAdd, onRemove }) => (
  <tr className="hover:bg-gray-50">
    <td className="px-4 py-2">{product.name}</td>
    <td className="px-4 py-2">{product.sku}</td>
    <td className="px-4 py-2">{product.category}</td>
    <td className="px-4 py-2">{product.unit}</td>
    <td className={`px-4 py-2 font-semibold ${getStockStatusClass(product.stock, product.minStock)}`}>
      {product.stock}
    </td>
    <td className="px-4 py-2">{product.minStock}</td>
    <td className="px-4 py-2">{product.warehouse}</td>
    <td className="px-4 py-2 flex gap-2">
      <button
        onClick={() => onEdit(product._id)}
        className="text-blue-600 hover:text-blue-800 transition-colors"
        aria-label="Edit product"
        title="Edit"
      >
        <FiEdit />
      </button>
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
    stock: PropTypes.number.isRequired,
    minStock: PropTypes.number.isRequired,
    warehouse: PropTypes.string.isRequired,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

const AllProducts = ({ products = [], onEdit = () => {}, onAdd = () => {}, onRemove = () => {} }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">All Products</h2>

      {products.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No products available.</p>
      ) : (
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
                  onEdit={onEdit}
                  onAdd={onAdd}
                  onRemove={onRemove}
                />
              ))}
            </tbody>
          </table>
        </div>
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
      stock: PropTypes.number.isRequired,
      minStock: PropTypes.number.isRequired,
      warehouse: PropTypes.string.isRequired,
    })
  ),
  onEdit: PropTypes.func,
  onAdd: PropTypes.func,
  onRemove: PropTypes.func,
};

export default AllProducts;