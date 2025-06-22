const express = require("express");
const router = express.Router();
const User = require("../models/user");

// إضافة عميل أو مورد
router.post("/", async (req, res) => {
  try {
    const newPerson = new User(req.body);
    await newPerson.save();
    res.status(201).json(newPerson);
  } catch (err) {
    res.status(500).json({ error: "فشل في الإضافة" });
  }
});

// عرض الكل (مع إمكانية التصفية حسب النوع)
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.type) {
      filter.type = req.query.type;
    }
    const people = await User.find(filter);
    res.json(people);
  } catch (err) {
    res.status(500).json({ error: "فشل في جلب البيانات" });
  }
});

// تعديل
router.put("/:id", async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "فشل في التعديل" });
  }
});

// حذف
router.delete("/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "تم الحذف بنجاح" });
  } catch (err) {
    res.status(500).json({ error: "فشل في الحذف" });
  }
});

module.exports = router;
