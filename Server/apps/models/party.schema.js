const mongoose = require('mongoose');

const partySchema = new mongoose.Schema(
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

        recordType: {
            type: String,
            enum: ['CUSTOMER', 'SUPPLIER'],
            required: true
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
        totalSales: { type: Number, default: 0 },
        totalPaid: { type: Number, default: 0 },
        totalDue: { type: Number, default: 0 },
        lastTransaction: {
            amount: {
                type: Number,
                default: 0
            },
            type: {
                type: String,
                enum: ['SALE', 'PURCHASE', 'PAYMENT', 'RETURN']
            },
            date: {
                type: Date
            }
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

module.exports = mongoose.model('Party', partySchema);
