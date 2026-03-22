const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const partyController=require('../../controllers/partyController')


router.use(authMiddleware);

router.get('/all',partyController.viewAllParty)
router.get('/card',partyController.viewPartyCard)
router.post('/add',partyController.createParty)
router.put('/update/:id',partyController.updateParty)
router.get("/:id", partyController.viewSingleParty);

// router.route('/')
//   .get(getCustomers)
//   .post(createCustomer);

// router.route('/:id/balance')
//   .get(getCustomerBalance);

// router.route('/:id')
//   .get(getCustomerById)
//   .put(updateCustomer)
//   .delete(softDeleteCustomer);

module.exports = router;
