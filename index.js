// Import dependencies
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");


// Initialize environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Import files
const userRoutes = require("./routes/user.route.js");
const profileRoutes = require("./routes/profile.route.js");

// user routes
app.use("/api/users", userRoutes);
app.use("/profile", profileRoutes);

// Basic Route
app.get("/", (req, res) => {
  res.send("Welcome to the Backend!");
});

// Global Error Handler
app.use((error, req, res, next) => {
  res.status(error.statusCode || 500).json({
    status: error.statusText || "error",
    message: error.message,
    code: error.statusCode || 500,
    data: null,
  });
});

// 404 Route
app.all("*", (req, res, next) => {
  res.status(404).json({
    status: "fail",
    message: "Page not found",
    code: 404,
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on Port ${PORT}`);
});
