const express = require("express");
const router = express.Router();

const User = require("../models/user");
const Invoice = require("../models/invoice");
const Product = require("../models/product");

router.get("/users-count", async (req, res) => {
  try {
    const { type } = req.query;

    if (type) {
      const count = await User.countDocuments({ type });
      return res.json({ type, count });
    }

    const suppliers = await User.countDocuments({ type: "supplier" });
    const customers = await User.countDocuments({ type: "customer" });
    res.json({ suppliers, customers });
  } catch (error) {
    res.status(500).json({ error: "حدث خطأ أثناء الحساب" });
  }
});

router.get("/invoices-count", async (req, res) => {
  try {
    const { type } = req.query;

    if (type) {
      const count = await Invoice.countDocuments({ type });
      return res.json({ type, count });
    }
    const sales = await Invoice.countDocuments({ type: "S" });
    const purchases = await Invoice.countDocuments({ type: "P" });
    res.json({ sales, purchases });
  } catch (error) {
    res.status(500).json({ error: "حدث خطأ أثناء الحساب" });
  }
});

router.get("/total-sold", async (req, res) => {
  try {
    const invoices = await Invoice.find({ type: "S" });

    let totalQuantity = 0;
    let totalRevenue = 0; // المبلغ المدفوع فقط (كاش أو دفعة أولى)
    let totalProfit = 0;

    let totalFinalPrice = 0; // كل الفواتير بدون خصم
    let totalRemaining = 0;
    let totalPaid = 0;
    let adminExpenses = 0;
    invoices.forEach((invoice) => {
      const invoiceFinal = invoice.finalPrice || 0;
      const invoiceRemaining = invoice.remaining || 0;
      const invoicePaid = invoiceFinal - invoiceRemaining;

      totalFinalPrice += invoiceFinal;
      totalRemaining += invoiceRemaining;
      totalPaid += invoicePaid;

      invoice.items.forEach((item) => {
        const quantity = item.quantity || 0;
        const unitPrice = item.unitPrice || 0;
        const buyPrice = item.buyPrice || 0;

        totalQuantity += quantity;
        totalProfit += quantity * (unitPrice - buyPrice);
      });

      totalRevenue += invoicePaid;
      adminExpenses += invoice.adminExpenses || 0;
    });
    const netProfit = totalProfit - adminExpenses;

    res.json({
      totalQuantity,
      totalRevenue,
      totalProfit,
      totalFinalPrice,
      totalPaid,
      totalRemaining,
      netProfit,
      adminExpenses,
    });
  } catch (error) {
    console.error("خطأ في حساب المبيعات:", error);
    res.status(500).json({ error: "فشل في حساب المبيعات" });
  }
});

router.get("/monthly-profit", async (req, res) => {
  try {
    const invoices = await Invoice.find({ type: "S" });
    const result = {};

    invoices.forEach((invoice) => {
      const month = new Date(invoice.createdAt).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });

      if (!result[month]) {
        result[month] = { revenue: 0, profit: 0 };
      }

      invoice.items.forEach((item) => {
        result[month].revenue += item.quantity * item.sellPrice;
        result[month].profit +=
          item.quantity * (item.sellPrice - item.buyPrice);
      });
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "فشل في حساب الأرباح الشهرية" });
  }
});
router.get("/top-products", async (req, res) => {
  try {
    const invoices = await Invoice.find({ type: "S" }).populate(
      "items.productId"
    );

    const productMap = {};

    invoices.forEach((invoice) => {
      invoice.items.forEach((item) => {
        const product = item.productId;
        if (!product) return;

        const name = product.name;
        const remaining = product.quantity;

        if (!productMap[product._id]) {
          productMap[product._id] = {
            name,
            soldQuantity: 0,
            remainingQuantity: remaining,
          };
        }

        productMap[product._id].soldQuantity += item.quantity;
      });
    });

    const sorted = Object.values(productMap)
      .sort((a, b) => b.soldQuantity - a.soldQuantity)
      .slice(0, 10);

    res.json(sorted);
  } catch (error) {
    console.error("فشل في حساب المنتجات الأعلى مبيعًا:", error);
    res.status(500).json({ error: "فشل في حساب المنتجات الأعلى مبيعًا" });
  }
});

module.exports = router;
