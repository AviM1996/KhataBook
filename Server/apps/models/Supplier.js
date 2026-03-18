const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a supplier name'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Please add a phone number'],
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    openingBalance: {
      type: Number,
      default: 0
    },
    balanceDirection: {
      type: String,
      enum: ['Receivable', 'Payable'],
      default: 'Payable' // Suppliers usually start as Payable
    },
    notes: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Supplier', supplierSchema);
