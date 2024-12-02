const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");

const verifyToken = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return next(new AppError("Not authenticated. Please log in.", 401, httpStatusText.FAIL));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    return next(new AppError("Invalid or expired token", 401, httpStatusText.FAIL));
  }
};

module.exports = verifyToken;