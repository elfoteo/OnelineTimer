// verifyToken.js
const {SECRET_KEY} = require('./constants');
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
  
    if (!token) {
        return res.status(401).send('Access denied. No token provided. Try to login again.');
    }
  
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Token verification error:', error.message);
        res.status(400).send('Invalid token, please login again.');
    }
};

module.exports = verifyToken;