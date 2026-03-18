const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Role = require("../models/Role")
const UserHasRoleMapping = require('../models/userHasRoleMapping');
const config = require('../config/config');
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt")

const parseTimeToMs = (timeStr) => {
    if (typeof timeStr === 'number') return timeStr;
    if (!timeStr || typeof timeStr !== 'string') return 0;

    const trimmed = timeStr.trim();
    const value = parseInt(trimmed);
    if (isNaN(value)) return 0;

    const unit = trimmed.toLowerCase().slice(-1);
    switch (unit) {
        case 's': return value * 1000;
        case 'm': return value * 60 * 1000;
        case 'h': return value * 60 * 60 * 1000;
        case 'd': return value * 24 * 60 * 60 * 1000;
        default: return value; // Assumes milliseconds if no unit
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "User account is inactive"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        const payload = {
            id: user._id,
            name: user.name,
            email: user.email,
            isActive: user.isActive
        };

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: false,
            sameSite: "Lax",
            maxAge: parseTimeToMs(config.auth.accessExpire)
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "Lax",
            maxAge: parseTimeToMs(config.auth.refreshExpire)
        });

        res.json({
            message: "Login successful",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                isActive: user.isActive
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const refreshTokenHandler = (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ message: "No refresh token" });
    }

    try {
        const decoded = jwt.verify(refreshToken, config.auth.refreshSecret);

        const newAccessToken = generateAccessToken({
            id: decoded.id,
            email: decoded.email,
            name: decoded.name,
            isActive: decoded.isActive
        });

        res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: false,
            sameSite: "Lax",
            maxAge: parseTimeToMs(config.auth.accessExpire)
        });

        res.json({ message: "Refreshed" });

    } catch {
        return res.status(401).json({ message: "Invalid refresh token" });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const logout = (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (refreshToken) {
            console.log('Invalidate token:', refreshToken);
        }

        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
        });

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
        });

        return res.json({ success: true, message: 'Logged out successfully' });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false });
    }
}

const registerUser = async (req, res) => {
    try {
        const { name, email, password, role = 'user' } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        // Find the requested role (default to 'user')
        const roleDoc = await Role.findOne({ name: role.toLowerCase() });
        if (roleDoc) {
            await UserHasRoleMapping.create({ userId: user._id, roleId: roleDoc._id });
        }

        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: roleDoc ? roleDoc.name : 'user',
                token: generateAccessToken({ id: user._id, name: user.name, email: user.email }),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    refreshTokenHandler,
    logout,
    loginUser,
    getMe,
};
