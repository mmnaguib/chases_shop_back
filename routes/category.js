const express = require("express");
const router = express.Router();
const Category = require("../models/category");

router.get("/", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: "خطأ في جلب التصنيفات" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: "التصنيف غير موجود" });
    }
    res.status(200).json(category);
  } catch (err) {
    res.status(500).json({ error: "خطأ في جلب التصنيف" });
  }
});

router.post("/", async (req, res) => {
  try {
    const newCategory = new Category({ name: req.body.name });
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(500).json({ error: "خطأ في إضافة التصنيف" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "خطأ في تعديل التصنيف" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "تم حذف التصنيف بنجاح" });
  } catch (err) {
    res.status(500).json({ error: "خطأ في حذف التصنيف" });
  }
});

module.exports = router;
