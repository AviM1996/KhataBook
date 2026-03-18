const express = require('express');
const router = express.Router();
const { registerUser, loginUser, refreshTokenHandler } = require('../../controllers/authController');
const validate = require('../../middleware/validate');
const { loginSchema, registerSchema } = require('../../validations/authValidation');

router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);
router.post('/refresh', refreshTokenHandler);

module.exports = router;
