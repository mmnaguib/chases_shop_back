const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const upload = require("../middleware/upload");

router.get("/", async (req, res) => {
  try {
    const products = await Product.find().populate("categoryId");
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "خطأ في جلب الأصناف" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "التصنيف غير موجود" });
    }
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ error: "خطأ في جلب التصنيف" });
  }
});

router.get("/categoryItems/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;

    const products = await Product.find({ categoryId }).populate("categoryId");

    res.status(200).json(products);
  } catch (err) {
    console.error("Error fetching products by category:", err);
    res.status(500).json({ error: "خطأ في جلب المنتجات حسب التصنيف" });
  }
});

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, categoryId, buyPrice, sellPrice } = req.body;
    const image = req.file ? req.file.path : "";

    const newProduct = new Product({
      name,
      categoryId,
      buyPrice,
      sellPrice,
      image,
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    console.error("🚨 Error while saving product:", err); // أضف دي عشان تشوف الخطأ الحقيقي
    res.status(500).json({ error: "فشل في إضافة الصنف" });
  }
});

router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { name, categoryId, buyPrice, sellPrice } = req.body;
    const image = req.file ? req.file.path : undefined;

    const updateData = {
      name,
      categoryId,
      buyPrice,
      sellPrice,
    };

    if (image) updateData.image = image;

    const updatedItem = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
      }
    ).populate("categoryId");

    res.status(200).json(updatedItem);
  } catch (err) {
    res.status(500).json({ error: "فشل في تعديل الصنف" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "تم حذف الصنف بنجاح" });
  } catch (err) {
    res.status(500).json({ error: "خطأ في حذف الصنف" });
  }
});

module.exports = router;
