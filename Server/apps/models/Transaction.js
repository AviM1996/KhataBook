const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: false
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: false
    },
    recordType: {
      type: String,
      enum: ['CUSTOMER', 'SUPPLIER'],
      required: [true, 'Record type is required']
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative']
    },
    type: {
      type: String,
      // For Customer: SALE (Debit), RETURN (Credit), PAYMENT (Credit)
      // For Supplier: PURCHASE (Credit), RETURN (Debit), PAYMENT (Debit)
      enum: ['CREDIT', 'DEBIT', 'SALE', 'RETURN', 'PAYMENT', 'PURCHASE'],
      required: [true, 'Transaction type is required']
    },
    description: {
      type: String,
      trim: true
    },
    paymentMethod: {
      type: String,
      enum: ['CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'N/A'],
      default: 'N/A'
    },
    date: {
      type: Date,
      default: Date.now
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

// Indexes to speed up customer transaction history queries
// transactionSchema.index({ customerId: 1, date: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
