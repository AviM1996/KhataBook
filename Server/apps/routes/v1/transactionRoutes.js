const express = require('express');
const router = express.Router();
const {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction
} = require('../../controllers/transactionController');

const transectionController = require('../../controllers/transactionController');

router.get('/all',transectionController.getTransactions)
router.post('/add',transectionController.createTransaction)

router.put('/update/:id', transectionController.updateTransaction)
router.delete('/delete/:id', transectionController.deleteTransaction)

module.exports = router;
