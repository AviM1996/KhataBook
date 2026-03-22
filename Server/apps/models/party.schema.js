const mongoose = require('mongoose');

// const lastTransactionSchema = new mongoose.Schema({
//     amount: {
//         type: Number,
//         default: 0
//     },
//     type: {
//         type: String,
//         enum: ['SALE', 'RETURN', 'PURCHASE', 'PAYMENT','OPENING_BALANCE'],
//         default: "OPENING_BALANCE"
//     },
//     date: {
//         type: Date,
//         default: null
//     }
// }, { _id: false });

const partySchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true
    },

    phone: {
        type: String,
        required: true,
        trim: true,
        unique: true
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

    // balanceDirection: {
    //     type: String,
    //     enum: ['Receivable', 'Payable'],
    // },

    notes: {
        type: String,
        trim: true
    },

    // totalSales: {
    //     type: Number,
    //     default: 0
    // },

    // totalPurchase: {
    //     type: Number,
    //     default: 0
    // },

    // totalPaid: {
    //     type: Number,
    //     default: 0
    // },

    // outstanding: {
    //     type: Number,
    //     default: 0
    // },

    // lastTransection: {
    //     type: Number,
    //     default: 0
    // },

    isActive: {
        type: Boolean,
        default: true
    }

}, {
    timestamps: true
});


partySchema.index({ name: 1 });
partySchema.index({ recordType: 1 });
partySchema.index({ isActive: 1 });

module.exports = mongoose.model('Party', partySchema);