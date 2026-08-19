const express = require("express");

const authController = require("../controller/auth.controller");

const router = express.Router();

router.post("/register", authController.UserRegister);

router.post("/login", authController.UserLogin);

router.post("/logout", authController.UserLogout);
module.exports = router;