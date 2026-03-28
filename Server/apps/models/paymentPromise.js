const mongoose = require("mongoose");

const paymentPromiseSchema = new mongoose.Schema(
  {
    partyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Party",
      required: true,
      index: true,
    },

    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      required: true,
      index: true,
    },

    promisedAmount: {
      type: Number,
      required: true,
    },

    // 💸 Already Paid (partial tracking)
    paidAmount: {
      type: Number,
      default: 0,
    },

    // 💰 Remaining (optional store or calculate)
    remainingAmount: {
      type: Number,
    },

    // 📅 Customer promise date
    promisedDate: {
      type: Date,
      required: true,
      index: true,
    },

    // 📞 Source of promise
    commitmentType: {
      type: String,
      enum: ["CALL", "VISIT", "WHATSAPP", "OTHER"],
      default: "CALL",
    },

    // 🌾 Reason (seasonal logic)
    reason: {
      type: String,
      enum: [
        "HARVEST",
        "SALARY",
        "BUSINESS_CYCLE",
        "PERSONAL",
        "OTHER",
      ],
      default: "OTHER",
    },

    note: {
      type: String,
      trim: true,
    },

    // 📊 Status tracking
    status: {
      type: String,
      enum: ["PROMISED", "PARTIAL", "FULFILLED", "BROKEN"],
      default: "PROMISED",
      index: true,
    },

    // 📅 Fulfilled date
    fulfilledAt: {
      type: Date,
    },

    // ⏱️ Delay tracking
    delayDays: {
      type: Number,
      default: 0,
    },

    // 🔗 Parent promise (for re-promise chain)
    parentPromiseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaymentPromise",
    },

    // 👤 audit
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

paymentPromiseSchema.index({ partyId: 1, status: 1 });
paymentPromiseSchema.index({ promisedDate: 1 });
paymentPromiseSchema.index({ transactionId: 1 });

module.exports = mongoose.model("PaymentPromise", paymentPromiseSchema);