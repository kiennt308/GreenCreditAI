const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// In-memory user storage (upgradeable to MongoDB)
const users = [];

const JWT_SECRET = 'greencreditsecret';
const JWT_EXPIRES_IN = '1h';

// User registration
const register = async (username, email, password) => {
    try {
        // Check if user already exists
        const existingUser = users.find(u => u.email === email || u.username === username);
        if (existingUser) {
            throw new Error('User already exists');
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create user
        const user = {
            id: users.length + 1,
            username,
            email,
            password: hashedPassword,
            createdAt: new Date()
        };

        users.push(user);

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        return {
            user: {
                id: user.id,
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
        const user = users.find(u => u.email === email);
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
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        return {
            user: {
                id: user.id,
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
const getUserById = (userId) => {
    return users.find(u => u.id === userId);
};

module.exports = {
    register,
    login,
    verifyToken,
    getUserById
};
