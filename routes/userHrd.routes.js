const router = require("express").Router();
const HrdController = require("../controllers/userHrd.controller");

router.post("/", HrdController.addHrd);
router.put("/edit/:id", HrdController.editHrd);
router.delete("/delete/:id", HrdController.deleteHrd);
router.get("/detail/:id", HrdController.getHrd);
router.get("/list", HrdController.listHrd);

module.exports = router;