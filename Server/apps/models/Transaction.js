const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({

    partyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Party',
        required: true
    },

    amount: {
        type: Number,
        required: true
    },

    type: {
        type: String,
        enum: ['SALE', 'PURCHASE', 'PAYMENT', 'RETURN'],
        required: true
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
    });

module.exports = mongoose.model('Transaction', transactionSchema);
