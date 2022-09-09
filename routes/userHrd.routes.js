const router = require("express").Router();
const HrdController = require("../controllers/userHrd.controller");
const { verifyToken } = require("../middleware/userAuth.middleware");

router.post("/", verifyToken, HrdController.addHrd);
router.put("/edit", verifyToken, HrdController.editHrd);
router.delete("/delete/:id", verifyToken, HrdController.deleteHrd);
router.get("/detail/:id", verifyToken, HrdController.getHrd);
router.get("/list", verifyToken, HrdController.listHrd);

module.exports = router;
