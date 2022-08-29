const router = require("express").Router();
const recapController = require("../controllers/recap.controller");
const { verifyToken } = require("../middleware/userAuth.middleware");

router.post("/", verifyToken, recapController.addRecap);

module.exports = router;
