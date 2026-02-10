require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/Product");

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);

    const result = await Product.updateMany(
      { stock: { $exists: false } },
      { $set: { stock: 0 } }
    );

    console.log(
      JSON.stringify(
        {
          acknowledged: result.acknowledged,
          matchedCount: result.matchedCount,
          modifiedCount: result.modifiedCount,
        },
        null,
        2
      )
    );
  } catch (err) {
    console.error("Migration failed:", err);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

run();
