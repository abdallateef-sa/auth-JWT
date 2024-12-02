const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");



router.route("/register")
  .post(authController.register);

router.route("/login")
  .post(authController.login);

router.route("/logout")
  .post(authController.logout);

router.route("/forgotPassword")
  .post(authController.forgotPassword);  

router.route("/verifyResetCode")
  .post(authController.verifyResetCode);    

router.route("/resetPassword")
  .put(authController.resetPassword);   

module.exports = router;  