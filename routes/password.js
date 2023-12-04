const express = require('express');
const router = express.Router();
const passwordController = require('../controllers/password');

router.get('/resetpassword/:id', passwordController.resetpassword)

router.use('/updatepassword/:id', passwordController.updatePassword);

router.post('/forgotpassword', passwordController.forgotPassword)

module.exports = router;