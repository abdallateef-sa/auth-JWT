import express from "express";
import authController from "../controllers/auth.controller.js";

const router = express.Router();

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

export default router;
