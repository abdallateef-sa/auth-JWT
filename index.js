const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));


mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));


const userRoutes = require("./routes/auth.route.js");
const profileRoutes = require("./routes/profile.route.js");


app.use("/api/auth", userRoutes);
app.use("/api/profile", profileRoutes);


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
