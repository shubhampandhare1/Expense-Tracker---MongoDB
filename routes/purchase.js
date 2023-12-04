const express = require('express');
const router = express.Router();
const userAuthenticate = require('../middleware/auth');
const purchaseController = require('../controllers/purchase');

router.get('/premiummembership', userAuthenticate.authenticate, purchaseController.purchasePremium);

router.post('/updatetransactionstatus', userAuthenticate.authenticate, purchaseController.updateTransactionStatus);

module.exports = router;