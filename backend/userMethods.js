const User = require('./models/userModel'); // Đường dẫn đến model User
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'greencreditsecret';
const JWT_EXPIRES_IN = '1h';

// User registration
const register = async (username, email, password) => {
    try {
        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            throw new Error('User already exists');
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create user
        const user = new User({
            username,
            email,
            password: hashedPassword,
            address: '', // Hoặc một giá trị hợp lệ
            esgScore: 0, // Hoặc một giá trị hợp lệ
            creditAmount: 0, // Hoặc một giá trị hợp lệ
            createdAt: new Date()
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        return {
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                createdAt: user.createdAt
            },
            token
        };
    } catch (error) {
        throw error;
    }
};

// User login
const login = async (email, password) => {
    try {
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('Invalid credentials');
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new Error('Invalid credentials');
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        return {
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                createdAt: user.createdAt
            },
            token
        };
    } catch (error) {
        throw error;
    }
};

// Verify JWT token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid token');
    }
};

// Get user by ID
const getUserById = async (userId) => {
    return await User.findById(userId);
};

module.exports = {
    register,
    login,
    verifyToken,
    getUserById
};
