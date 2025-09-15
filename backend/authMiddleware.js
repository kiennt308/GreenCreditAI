const { verifyToken, getUserById } = require('./userMethods');

// JWT Authentication Middleware
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const decoded = verifyToken(token);
        const user = await getUserById(decoded.userId);
        
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        req.user = {
            id: user.userId,
            username: user.username,
            email: user.email
        };
        
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};

module.exports = {
    authenticateToken
};
