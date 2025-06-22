const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["P", "S"],
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  notes: {
    type: String,
    default: "",
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      unitPrice: {
        type: Number,
        required: true,
      },
    },
  ],
  totalPrice: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    default: 0,
  },
  finalPrice: {
    type: Number,
    required: true,
  },
  paymentMethods: [
    {
      method: {
        type: String,
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
    },
  ],
  remaining: {
    type: Number,
    default: 0,
  },
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
  },

});

module.exports = mongoose.model("Invoice", invoiceSchema);
