const express = require('express');
const totalClaimController = require('../controllers/totalClaim.controller');
const { verifyToken } = require('../middleware/userAuth.middleware');

const router = express.Router();

router.get('/', totalClaimController.totalClaim);

module.exports = router;
