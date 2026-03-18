const express = require('express');
const router = express.Router();

router.use('/auth', require('./authRoutes'));
router.use('/customers', require('./customerRoutes'));
router.use('/suppliers', require('./supplierRoutes'));
router.use('/transactions', require('./transactionRoutes'));

module.exports = router;