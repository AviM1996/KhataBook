const express = require('express');
const router = express.Router();
const {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction
} = require('../../controllers/transactionController');

const transectionController = require('../../controllers/transactionController');
const dashboardController = require('../../controllers/dashboardController');

router.get('/all',transectionController.getTransactions)
router.post('/add',transectionController.createTransaction)

router.put('/update/:id', transectionController.updateTransaction)
router.delete('/delete/:id', transectionController.deleteTransaction)

router.get('/dashboard', dashboardController.getDashboardData);

module.exports = router;
