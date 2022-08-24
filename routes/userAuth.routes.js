const router = require("express").Router();
const AuthController = require("../controllers/userAuth.controller");

router.post("/login", AuthController.login);
router.post("/signup", AuthController.signup);
router.delete("/logout", AuthController.logout);

module.exports = router;