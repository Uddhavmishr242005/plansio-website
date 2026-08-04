const router = require('express').Router();
const { sendOTP, verifyOTP, firebaseLogin, register, login, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/send-otp',      sendOTP);
router.post('/verify-otp',    verifyOTP);
router.post('/firebase',      firebaseLogin);
router.post('/register',      register);
router.post('/login',         login);
router.get('/me',             protect, getMe);

module.exports = router;
