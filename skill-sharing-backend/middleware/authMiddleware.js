// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization'); // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        // Extract token from 'Bearer <token>' string
        const tokenString = token.split(' ')[1];
        const decoded = jwt.verify(tokenString, process.env.JWT_SECRET);
        req.user = decoded.user; // Attach user info to the request
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = verifyToken;