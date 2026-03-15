const mongoose = require('mongoose');

const VALID_ROLES = ['superadmin', 'systemadmin', 'admin', 'user'];

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a role name'],
      unique: true,
      enum: {
        values: VALID_ROLES,
        message: `Role must be one of: ${VALID_ROLES.join(', ')}`
      },
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
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

module.exports = mongoose.model('Role', roleSchema);
