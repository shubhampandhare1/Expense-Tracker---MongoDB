const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization');
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const user = await User.findById(decoded.userId);
        req.user = user;
        next();
    }
    catch (err) {
        console.log('error at authenticate middleware>>>>>', err);
        return res.status(401).json({ success: false });
    }
}

module.exports = {
    authenticate
}