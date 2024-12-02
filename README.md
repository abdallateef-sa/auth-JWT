# User Management System - V 0.2.0

## Project Overview

The **User Management System** is a backend application designed for user registration, authentication, and profile management. It includes secure password reset functionality. Built with **Node.js** and **Express.js**, it uses **JWT** for authentication and **MongoDB** as the database. The system emphasizes security and ease of integration with a frontend.

### Key Features:
- **User Registration**: Allows users to create accounts with email, phone, and password.
- **Login**: Authenticates users and returns a JWT token.
- **Profile Retrieval**: Users can fetch their profile details.
- **Password Reset**: Allows users to reset their passwords via a secure email process.

### Security Highlights:
- **JWT Authentication**: Tokens are stored securely to protect API endpoints.
- **Password Hashing**: Passwords are hashed using **bcryptjs**.
- **Email Notifications**: Password reset links are sent securely through email.

---

## Project Architecture

### 1. **User Model**
Defines the schema for storing user data in the database:
- **Name**: User's full name.
- **Email and Phone**: Unique identifiers for authentication.
- **Password**: Stored as a hashed string.
- **Reset Token**: Used for password reset functionality.

### 2. **Authentication Controller**
Handles key operations:
- **register**: Validates and creates new user accounts.
- **login**: Verifies credentials and generates JWT tokens.
- **forgotPassword**: Sends password reset email with a token.
- **resetPassword**: Updates the password using a valid reset token.

### 3. **Authentication Middleware**
Protects sensitive routes by verifying JWT tokens.

### 4. **Email Utility**
Uses **nodemailer** with Gmail to send emails, such as password reset links.

---

## How It Works

### **Password Reset Process Using Gmail**

#### 1. Forgot Password
- **Request**: User sends a POST request to `/auth/forgot-password` with their registered email.
- **Backend Operation**:
  - Checks if the email exists in the database.
  - Generates a secure token and stores it with an expiration time in the database.
  - Sends a reset link to the user's email.
- **Response**: Success message indicating that an email has been sent.

#### 2. Reset Password
- **Request**: User clicks the link in the email and submits a POST request to `/auth/reset-password` with the new password and token.
- **Backend Operation**:
  - Verifies the token and expiration.
  - Hashes the new password and updates it in the database.
- **Response**: Confirmation of a successful password reset.

#### ⚠️ **Important Notes for Gmail Integration**
1. **Gmail Account Settings**:
   - Use a Gmail account dedicated to system emails.
   - Enable **"Less Secure App Access"** in Gmail or set up an **App Password** if 2FA (Two-Factor Authentication) is enabled.
   - Use an environment variable to store the Gmail account credentials securely.
   - Example for `.env` file:
     ```env
     NODEMAILER_EMAIL=your_gmail_account@gmail.com
     NODEMAILER_PASSWORD=your_gmail_password_or_app_password
     ```

2. **Environment Configuration**:
   Ensure the email credentials are never hardcoded in the application code and are only accessed via environment variables.

3. **Rate Limiting**:
   To prevent abuse, add rate limiting for the `/auth/forgot-password` endpoint.

---

## API Endpoints

### **Authentication Routes**
| Method | Endpoint              | Description                   |
|--------|-----------------------|-------------------------------|
| POST   | `/auth/register`      | Register a new user.          |
| POST   | `/auth/login`         | Authenticate user.            |
| POST   | `/auth/forgot-password` | Request a password reset.    |
| POST   | `/auth/reset-password`  | Reset password using token.  |

### **Profile Route**
| Method | Endpoint              | Description                   |
|--------|-----------------------|-------------------------------|
| GET    | `/profile`            | Retrieve user profile.        |

---

## Technologies Used
- **Node.js**: Backend runtime.
- **Express.js**: Web framework.
- **MongoDB**: NoSQL database.
- **JWT**: Token-based authentication.
- **bcryptjs**: Password hashing.
- **nodemailer**: Email service for password reset.

---

## Installation Instructions

### Prerequisites
- **Node.js** and **npm** installed.
- A **MongoDB** instance (local or hosted).

### Steps to Run Locally
1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/user-management-system.git
   cd user-management-system
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   NODEMAILER_EMAIL=your_gmail_account@gmail.com
   NODEMAILER_PASSWORD=your_email_password_or_app_password
   ```

4. **Start the server**:
   ```bash
   npm start
   ```

   The server will run at `http://localhost:5000`.

---

## Frontend Integration
1. **Forgot Password**:
   - Send a POST request to `/auth/forgot-password` with the user’s email.
   - Use the reset link sent via email to prompt the user for a new password.

2. **Reset Password**:
   - Use the token from the reset link to send a POST request to `/auth/reset-password` with the new password.

3. **Profile Management**:
   - Send a GET request to `/profile` with the JWT token for retrieving profile details.
