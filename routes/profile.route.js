const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken.js"); 
const { getProfile } = require("../controllers/profile.controller.js"); 

router.route("/").get(verifyToken, getProfile);

module.exports = router;
