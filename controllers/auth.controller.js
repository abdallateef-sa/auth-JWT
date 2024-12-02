const user = require("../models/user.model");
const httpStatusText = require("../utils/httpStatusText");
const AppError = require("../utils/appError");
const bcrypt = require("bcrypt");
const generateJWT = require("../utils/generateJWT");
const sendMail = require("../utils/sendMaile");
const asyncWrapper = require("../middlewares/asyncWrapper");

const register = asyncWrapper(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    password,
    dateOfBirth,
    gender,
    phone,
    country,
    address,
    role,
  } = req.body;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !password ||
    !dateOfBirth ||
    !gender ||
    !phone ||
    !role
  ) {
    return next(
      new AppError(
        "Please provide all required fields",
        400,
        httpStatusText.FAIL
      )
    );
  }

  const validRoles = ["Doctor", "Patient", "Amenities", "Admin"];
  if (!validRoles.includes(role)) {
    return next(
      new AppError(
        "Invalid role. Allowed roles are: Doctor, Patient, Amenities",
        400,
        httpStatusText.FAIL
      )
    );
  }

  const existingUser = await user.findOne({
    $or: [{ email }, { phone }],
  });

  if (existingUser) {
    return next(
      new AppError(
        "User already exists with this email or phone number",
        409,
        httpStatusText.FAIL
      )
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const newUser = new user({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    dateOfBirth,
    gender,
    phone,
    country,
    address,
    role,
  });

  const token = await generateJWT({
    email: newUser.email,
    id: newUser._id,
    role: newUser.role,
  });
  newUser.token = token;

  await newUser.save();

  res
    .status(201)
    .json({ status: httpStatusText.SUCCESS, data: { user: newUser } });
});

const login = asyncWrapper(async (req, res, next) => {
  const { emailOrPhone, password } = req.body;

  if (!emailOrPhone || !password) {
    return next(
      new AppError(
        "Please provide email/phone and password",
        400,
        httpStatusText.FAIL
      )
    );
  }

  const foundUser = await user.findOne({
    $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
  });

  if (!foundUser) {
    return next(new AppError("User not found", 404, httpStatusText.FAIL));
  }

  const matchedPassword = await bcrypt.compare(password, foundUser.password);

  if (matchedPassword) {
    const token = await generateJWT({
      email: foundUser.email,
      id: foundUser._id,
      role: foundUser.role,
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    return res.status(200).json({ status: httpStatusText.SUCCESS, data: {} });
  } else {
    return next(
      new AppError(
        "Email/Phone or password is incorrect",
        401,
        httpStatusText.FAIL
      )
    );
  }
});

const logout = asyncWrapper(async (req, res, next) => {
  if (!req.cookies.token) {
    return res.status(400).json({
      status: httpStatusText.FAIL,
      message: "No token found to log out",
    });
  }

  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Logged out successfully",
  });
});

const forgotPassword = asyncWrapper(async (req, res, next) => {
  const { emailOrPhone } = req.body;

  if (!emailOrPhone) {
    return next(
      new AppError("Please provide email or phone", 400, httpStatusText.FAIL)
    );
  }

  const foundUser = await user.findOne({
    $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
  });

  if (!foundUser) {
    return next(new AppError("User not found", 404, httpStatusText.FAIL));
  }

  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = await bcrypt.hash(resetCode, 9);

  foundUser.passwordResetCode = hashedResetCode;
  foundUser.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  foundUser.passwordResetVerified = false;

  await foundUser.save();

  const html = `
    <h2 style="color: #4CAF50; text-align: center;">Password Reset Request</h2>
    <p>Dear ${foundUser.firstName} ${foundUser.lastName},</p>
    <p>We received a request to reset your password. Please use the following code to reset your password. This code will expire in 10 minutes:</p>
    <h3 style="text-align: center; color: #333;">${resetCode}</h3>
    <p>If you did not request a password reset, you can safely ignore this email.</p>
    <p>For your security, never share this code with anyone.</p>
    <hr />
    <p style="font-size: 12px; color: #888;">If you have any questions, please contact our support team at <a href="mailto:neuroguard6@gmail.com">neuroguard6@gmail.com</a>.</p>
    <p style="font-size: 12px; color: #888;">Thank you,<br />The Neuro Guard Team</p>
  `;

  try {
    await sendMail({
      email: foundUser.email,
      subject: "Password Reset Code",
      html,
    });
  } catch (error) {
    foundUser.passwordResetCode = undefined;
    foundUser.passwordResetExpires = undefined; // 10 minutes
    foundUser.passwordResetVerified = undefined;

    await foundUser.save();

    return next(new AppError("Failed to send password reset code",500,httpStatusText.ERROR));
  }
  return res
    .status(200)
    .json({
      status: httpStatusText.SUCCESS,
      message: "Password reset code sent successfully",
    });
});

const verifyResetCode = asyncWrapper(async (req, res, next) => {
  const { resetCode } = req.body;

  if (!resetCode) {
    return next(new AppError("Please provide reset code", 400, httpStatusText.FAIL));
  }

  const foundUser = await user.findOne({
    passwordResetExpires: { $gt: Date.now() }, 
    passwordResetCode: { $exists: true }, 
  });

  if (!foundUser) {
    return next(new AppError("Invalid or expired reset code", 400, httpStatusText.FAIL));
  }

  const matchedResetCode = await bcrypt.compare(resetCode, foundUser.passwordResetCode);

  if (!matchedResetCode) {
    return next(new AppError("Invalid reset code", 400, httpStatusText.FAIL));
  }

  foundUser.passwordResetVerified = true;
  await foundUser.save();

  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Reset code verified successfully",
  });
});

const resetPassword = asyncWrapper(async (req, res, next) => {
  const { newPassword } = req.body;

  if (!newPassword) {
    return next(new AppError("Please provide new password", 400, httpStatusText.FAIL));
  }

  const foundUser = await user.findOne({
    passwordResetExpires: { $gt: Date.now() }, 
    passwordResetCode: { $exists: true }, 
    passwordResetVerified: true, 
  });

  if (!foundUser) { 
    return next(new AppError("Invalid or expired reset code", 400, httpStatusText.FAIL));
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  foundUser.password = hashedPassword;
  foundUser.passwordResetCode = undefined;
  foundUser.passwordResetExpires = undefined; // 10 minutes 
  foundUser.passwordResetVerified = undefined;

  await foundUser.save();

  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Password reset successfully",
  });
});

module.exports = {
  register,
  login,
  logout,
  forgotPassword,
  verifyResetCode,
  resetPassword
};
