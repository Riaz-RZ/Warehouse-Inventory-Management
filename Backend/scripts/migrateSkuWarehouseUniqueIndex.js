require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/Product");

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);

    const collection = Product.collection;

    const indexes = await collection.indexes();
    const hasSkuIndex = indexes.some((idx) => idx.name === "sku_1");

    if (hasSkuIndex) {
      await collection.dropIndex("sku_1");
      console.log("Dropped old unique index: sku_1");
    } else {
      console.log("No sku_1 index found (nothing to drop)");
    }

    // Create compound unique index for (sku, warehouse)
    await collection.createIndex(
      { sku: 1, warehouse: 1 },
      { unique: true, name: "sku_1_warehouse_1" }
    );
    console.log("Created unique index: sku_1_warehouse_1");

    console.log("OK");
  } catch (err) {
    console.error("Index migration failed:", err);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

run();
