const mongoose = require('mongoose');

const blacklistedTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // TTL index: documents expire at the Date specified in expiresAt
  },
}, { timestamps: true });

module.exports = mongoose.model('BlacklistedToken', blacklistedTokenSchema);
