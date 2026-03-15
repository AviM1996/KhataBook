const express = require('express');
const router = express.Router();
const {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  softDeleteCustomer,
  getCustomerBalance
} = require('../controllers/customerController');

router.route('/')
  .get(getCustomers)
  .post(createCustomer);

router.route('/:id/balance')
  .get(getCustomerBalance);

router.route('/:id')
  .get(getCustomerById)
  .put(updateCustomer)
  .delete(softDeleteCustomer);

module.exports = router;
