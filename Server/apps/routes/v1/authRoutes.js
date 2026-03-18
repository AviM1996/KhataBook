const express = require('express');
const router = express.Router();

const { registerUser, loginUser, refreshTokenHandler, logout, getMe } = require('../../controllers/authController');
const validate = require('../../middleware/validate');
const { loginSchema, registerSchema } = require('../../validations/authValidation');
const authMiddleware = require('../../middleware/authMiddleware');

router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);
router.post('/logout', logout);
router.post('/refresh', refreshTokenHandler);
router.get('/me', authMiddleware, getMe);

module.exports = router;
