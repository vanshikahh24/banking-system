const express = require("express");
const router = express.Router();

const {
    authMiddleware
} = require("../middleware/auth.middleware");

const AccountController = require("../controller/account.controller");

router.post("/", authMiddleware, AccountController.createAccountController);
/** GET API */
router.get("/", authMiddleware, AccountController.getUserAccountController);
module.exports = router;