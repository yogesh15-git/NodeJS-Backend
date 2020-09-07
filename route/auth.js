const express = require('express');
const { register, login, getUser, forgotPassword, resetPassword, updateUser, updatePassword, logoutUser } = require('../controller/auth');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logoutUser);
router.post('/getuser', protect, getUser);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.put('/updateuser', protect, updateUser);
router.put('/updatepassword', protect, updatePassword);




module.exports = router;