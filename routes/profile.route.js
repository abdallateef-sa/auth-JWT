const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken.js"); // تأكد من إضافة middleware لحماية المسارات
const { getProfile } = require("../controllers/profile.controller.js"); // التأكد من تصدير `getProfile` بشكل صحيح

// مسار الملف الشخصي (محمي بواسطة التوكن)
router.route("/").get(verifyToken, getProfile);

module.exports = router;
