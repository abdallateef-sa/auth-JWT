import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import { getProfile } from "../controllers/profile.controller.js";

const router = express.Router();

router.route("/").get(verifyToken, getProfile);

export default router;
