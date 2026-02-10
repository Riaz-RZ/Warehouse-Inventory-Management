const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sku: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    unit: {
      type: String,
      required: true,
      trim: true,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    warehouse: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

productSchema.index({ sku: 1, warehouse: 1 }, { unique: true });

module.exports = mongoose.model("Product", productSchema);
