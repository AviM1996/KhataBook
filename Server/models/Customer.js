const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a customer name'],
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
      default: 'Receivable'
    },
    reminderDate: {
      type: Date
    },
    notes: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true // Used for soft deletes
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

// Add an index to improve search queries if needed later
// customerSchema.index({ name: 'text', phone: 'text' });

module.exports = mongoose.model('Customer', customerSchema);
