const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/authMiddleware');

// Route: POST /auth/register
router.post('/register', upload.single('profileImage'), authController.registerUser);
router.post('/login', authController.loginUser);
router.post('/logout', authenticateToken, authController.logoutUser);
router.get('/isAuthenticated', authenticateToken, authController.isAuthenticated);
router.post('/checkLogin', authController.checkLogged);
router.post('/getUser',authController.getUserIdIfLoggedIn);
//router.post('/updateBoxes', authController.updateUserBoxes);
router.post('/updateProfile', upload.single('profileImage'),authController.updateProfile);
router.get('/getProfileData',authController.getProfileData);
router.post('/checkBeforeReset',authController.checkBeforeReset);
router.post('/resetPass',authController.reset);


module.exports = router;
