const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../../controllers/authController');
const validate = require('../../middleware/validate');
const { loginSchema, registerSchema } = require('../../validations/authValidation');

router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);

module.exports = router;
