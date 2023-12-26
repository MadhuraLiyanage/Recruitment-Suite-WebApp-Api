const express = require("express");
const router = express.Router();
const logoutController = require("../controllers/auth/logout.controller");

router.post("/", logoutController.logoutUser);

module.exports = router;
