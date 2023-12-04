const express = require('express');
const router = express.Router();
const userAuthenticate = require('../middleware/auth');
const premiumController = require('../controllers/premiumFeature');

router.get('/showleaderboard', userAuthenticate.authenticate, premiumController.showLeaderboard);
router.get('/download', userAuthenticate.authenticate, premiumController.downloadExpense);
router.get('/recentdownload', userAuthenticate.authenticate, premiumController.recentlyDownloadedFiles);

module.exports = router;