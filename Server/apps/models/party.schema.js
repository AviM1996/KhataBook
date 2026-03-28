const mongoose = require("mongoose");

const partySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    recordType: {
      type: String,
      enum: ["CUSTOMER", "SUPPLIER"],
      required: true,
    },

    notes: {
      type: String,
      trim: true,
    },

    outstanding: {
      type: Number,
      default: 0,
    },

    totalCredit: {
      type: Number,
      default: 0,
    },

    totalDebit: {
      type: Number,
      default: 0,
    },

    creditLimit: {
      type: Number,
      default: 0,
    },

    creditUtilization: {
      type: Number, // outstanding / creditLimit
      default: 0,
    },

    avgPaymentDays: {
      type: Number,
      default: 0,
    },

    paymentConsistencyScore: {
      type: Number,
      default: 0,
    },

    lastPaymentDate: {
      type: Date,
      default: Date.now,
    },

    lastPaymentAmount:{
      type: Number,
      default: 0,
    },

     totalTransactions: {
      type: Number,
      default: 0,
    },

    purchaseFrequency: {
      type: Number,
      default: 0,
    },

    lifetimeValue: {
      type: Number,
      default: 0,
    },

    lastTransactionDate: {
      type: Date,
      default: Date.now,
    },

    lastInteractionDate: { 
        type: Date 
    },

    overdueAmount: {
      type: Number,
      default: 0,
      index: true,
    },

    overdueDays: {
      type: Number,
      default: 0,
    },

    isOverdue: {
      type: Boolean,
      default: false,
      index: true,
    },

     riskScore: {
      type: Number,
      default: 0,
      index: true,
    },

    riskLevel: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "LOW",
      index: true,
    },

    isHighRisk: {
      type: Boolean,
      default: false,
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

     isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

partySchema.index({ name: 1, phone: 1 });
partySchema.index({ riskLevel: 1, isActive: 1 });

module.exports = mongoose.model("Party", partySchema);
