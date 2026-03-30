const express = require('express');
const router = express.Router();
const validate = require('../../libs/middleware/validate')
const authMiddleware = require('../../libs/middleware/authMiddleware');
const { registerUser, loginUser, refreshTokenHandler, logout, getMe } = require('../../controllers/authController');
const { loginSchema, registerSchema } = require('../../libs/validator/authValidation');

router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);
router.post('/logout', logout);
router.post('/refresh', refreshTokenHandler);
router.get('/me', authMiddleware, getMe);

module.exports = router;
