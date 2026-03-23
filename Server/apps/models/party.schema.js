const mongoose = require('mongoose');

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

    notes: {
        type: String,
        trim: true
    },

    outstanding: {
        type: Number,
        default: 0
    },

    lastTransection: {
         type: Date,
        default: Date.now
    },

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