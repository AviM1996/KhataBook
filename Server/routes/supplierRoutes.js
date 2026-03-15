const express = require('express');
const router = express.Router();
const {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  softDeleteSupplier,
  getSupplierBalance
} = require('../controllers/supplierController');

// All routes are public for now based on other files
router.route('/')
  .get(getSuppliers)
  .post(createSupplier);

router.route('/:id')
  .get(getSupplierById)
  .put(updateSupplier)
  .delete(softDeleteSupplier);

router.route('/:id/balance')
  .get(getSupplierBalance);

module.exports = router;
