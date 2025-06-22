const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ DB Error:", err));

app.get("/", (req, res) => {
  res.send("🚀 Backend شغال تمام");
});

const productRoutes = require("./routes/products");
const categoriesRoutes = require("./routes/category");
const usersRoutes = require("./routes/user");
const invoiceRoutes = require("./routes/invoice");
app.use("/api/products", productRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/invoices", invoiceRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
