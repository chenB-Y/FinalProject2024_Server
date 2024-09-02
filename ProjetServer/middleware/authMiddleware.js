// middleware/authMiddleware.js

const Session = require('../models/Session');

const authenticateUser = async (req, res, next) => {
    const username = req.body.username;
    try {
        const session = await Session.findOne({ username });

        if (!username || !session) {
            return res.status(401).json({ success: false, message: 'Not authenticated.' });
        }

        req.user = {
            userId: session.userId,
            username: session.username
        };
        console.log("user: " + req.user);
        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

module.exports = authenticateUser;

