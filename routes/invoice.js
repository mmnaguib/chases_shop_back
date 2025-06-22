const express = require("express");
const router = express.Router();
const Invoice = require("../models/invoice");
const Product = require("../models/product");

// ✅ GET all invoices
router.get("/", async (req, res) => {
  try {
    const { type } = req.query;

    let filter = {};
    if (type) {
      filter.type = type;
    }

    const invoices = await Invoice.find(filter)
      .populate("userId")
      .populate("items.productId");
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ GET single invoice
router.get("/:id", async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { type, items } = req.body;

    // ✅ التحقق من نوع الفاتورة
    if (!type || !["P", "S"].includes(type)) {
      return res.status(400).json({ message: "نوع الفاتورة غير صحيح" });
    }

    // ✅ التحقق من وجود عناصر في الفاتورة
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "الرجاء إدخال عناصر الفاتورة" });
    }

    // ✅ التحقق من أن الكمية أرقام صحيحة
    for (let item of items) {
      if (
        !item.productId ||
        typeof item.quantity !== "number" ||
        isNaN(item.quantity)
      ) {
        return res
          .status(400)
          .json({ message: "تأكد من أن الكمية رقم صحيح لكل عنصر" });
      }
    }

    // ✅ توليد رقم الفاتورة
    const count = await Invoice.countDocuments({ type });
    const prefix = type === "P" ? "p" : "s";
    const invoiceNumber = `${prefix}-${count + 1}`;

    // ✅ إنشاء الفاتورة
    const invoice = new Invoice({
      ...req.body,
      invoiceNumber, // توليد تلقائي
    });

    await invoice.save();

    // ✅ تحديث كمية المنتجات
    for (let item of invoice.items) {
      const product = await Product.findById(item.productId);
      if (!product) continue;

      if (type === "P") {
        product.quantity += item.quantity;
      } else if (type === "S") {
        product.quantity -= item.quantity;
        // Optional: تحقق من أن الكمية لا تقل عن صفر
        if (product.quantity < 0) product.quantity = 0;
      }

      await product.save();
    }

    res.status(201).json(invoice);
  } catch (err) {
    console.error("Error creating invoice:", err);
    res.status(500).json({ message: "حدث خطأ أثناء إنشاء الفاتورة" });
  }
});

// ✅ PUT update invoice
router.put("/:id", async (req, res) => {
  try {
    const { totalPrice, finalPrice, remaining, customer, date } = req.body;

    const parsedTotal = parseFloat(totalPrice);
    const parsedFinal = parseFloat(finalPrice);
    const parsedRemain = parseFloat(remaining);

    if ([parsedTotal, parsedFinal, parsedRemain].some(isNaN)) {
      return res.status(400).json({
        message: "totalPrice, finalPrice, and remaining must be numbers",
      });
    }

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    invoice.totalPrice = parsedTotal;
    invoice.finalPrice = parsedFinal;
    invoice.remaining = parsedRemain;
    invoice.customer = customer ?? invoice.customer;
    invoice.date = date ?? invoice.date;

    const updatedInvoice = await invoice.save();
    res.json(updatedInvoice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ✅ DELETE invoice
router.delete("/:id", async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.json({ message: "Invoice deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
