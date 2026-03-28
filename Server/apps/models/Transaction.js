const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    partyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Party',
      required: true,
      index: true,
    },

    transactionCode: {
      type: String,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    remainingAmount: {
      type: Number,
    },

    type: {
      type: String,
      enum: ['SALE', 'PURCHASE', 'PAYMENT', 'RETURN'],
      required: true,
      index: true,
    },

    direction: {
      type: String,
      enum: ['IN', 'OUT'], // IN = receive, OUT = give
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ['PENDING', 'PARTIAL', 'PAID', 'OVERDUE'],
      default: 'PENDING',
      index: true,
    },

    date: {
      type: Date,
      default: Date.now,
      index: true,
    },

    dueDate: {
      type: Date,
      index: true,
    },

    paidAt: {
      type: Date,
    },

    daysToPay: Number,

    linkedTransactionIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
      },
    ],

    invoiceNumber: String,
    referenceId: String,

    paymentMethod: {
      type: String,
      enum: ['CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'N/A'],
      default: 'N/A',
    },

    description: {
      type: String,
      trim: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// 🔥 Important Indexes
transactionSchema.index({ partyId: 1, date: -1 });
transactionSchema.index({ partyId: 1, status: 1 });
transactionSchema.index({ dueDate: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);