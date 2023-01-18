const router = require("express").Router();
const recapController = require("../controllers/recap.controller");
const { verifyToken } = require("../middleware/userAuth.middleware");
const upload = require("../middleware/fileUpload.middleware");

router.post("/", verifyToken, recapController.addRecap);
router.post("/file", verifyToken, upload.single("recap_data"), recapController.addRecapFile);
router.get("/", verifyToken, recapController.listRecap);
module.exports = router;
