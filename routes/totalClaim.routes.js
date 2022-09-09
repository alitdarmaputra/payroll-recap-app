const express = require('express');
const totalClaimController = require('../controllers/totalClaim.controller');
const { verifyToken } = require('../middleware/userAuth.middleware');

const router = express.Router();

router.get('/', verifyToken, totalClaimController.totalClaim);
router.get('/show', verifyToken, totalClaimController.showRecap);
router.get('/download', totalClaimController.downloadRecap);

module.exports = router;
