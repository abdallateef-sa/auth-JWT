const user = require("../models/user.model");
const httpStatusText = require("../utils/httpStatusText");
const AppError = require("../utils/appError");
const bcrypt = require("bcrypt");
const generateJWT = require("../utils/generateJWT");
const jwt = require("jsonwebtoken");

const register = async (req, res, next) => {
  try {
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

    if (!firstName || !lastName || !email || !password || !dateOfBirth || !gender || !phone || !role) {
      return next(new AppError("Please provide all required fields", 400, httpStatusText.FAIL));
    }

    const validRoles = ["Doctor", "Patient", "Amenities", "Admin"];
    if (!validRoles.includes(role)) {
      return next(new AppError("Invalid role. Allowed roles are: Doctor, Patient, Amenities", 400, httpStatusText.FAIL));
    }

    const existingUser = await user.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return next(new AppError("User already exists with this email or phone number", 409, httpStatusText.FAIL));
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
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
      return next(new AppError("Please provide email/phone and password", 400, httpStatusText.FAIL));
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

      return res.status(200).json({ status: httpStatusText.SUCCESS, data: {  } });
    } else {
      return next(new AppError("Email/Phone or password is incorrect", 401, httpStatusText.FAIL));
    }
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
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
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
};
