const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const partyController=require('../../controllers/partyController')

const {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  softDeleteCustomer,
  getCustomerBalance
} = require('../../controllers/customerController');

router.use(authMiddleware);

router.get('/all',partyController.viewAllParty)

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
