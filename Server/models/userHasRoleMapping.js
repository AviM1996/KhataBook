const mongoose = require('mongoose');

const userHasRoleMappingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a userId']
    },
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      required: [true, 'Please provide a roleId']
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

// Compound index to prevent duplicate user-role assignments
userHasRoleMappingSchema.index({ userId: 1, roleId: 1 }, { unique: true });

module.exports = mongoose.model('UserHasRoleMapping', userHasRoleMappingSchema);
