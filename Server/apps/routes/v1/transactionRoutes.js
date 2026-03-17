const express = require('express');
const router = express.Router();
const {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction
} = require('../../controllers/transactionController');

// Define API routes for transactions
router.route('/')
  .get(getTransactions)
  .post(createTransaction);

router.route('/:id')
  .put(updateTransaction)
  .delete(deleteTransaction);

module.exports = router;
