
# Backend API - User Management - V 0.1.0

This is a backend API built with **Express.js** and **MongoDB**. It provides various functionalities such as user registration, login, profile management, and authentication. The API is secured with JWT (JSON Web Tokens) for authentication and uses cookies for storing tokens.

## Features

- User Registration
- User Login
- User Logout
- Protected Profile Route (only accessible to authenticated users)
- Secure JWT Authentication with Cookies

## Tech Stack

- **Backend Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **API Documentation**: Postman

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/your-repo.git
   ```

2. Navigate to the project directory:

   ```bash
   cd your-repo
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

4. Create a `.env` file in the root directory and set the following environment variables:

   ```env
   MONGODB_URL=mongodb://localhost:27017/your-database
   PORT=3000
   JWT_SECRET_KEY=your-secret-key
   JWT_EXPIRATION=1h
   ```

5. Start the application:

   ```bash
   npm start
   ```

   The server will be running on `http://localhost:3000`.

## API Endpoints

### Authentication & User Management

- **POST /api/users/register**  
  Registers a new user with required information (firstName, lastName, email, password, etc.).

- **POST /api/users/login**  
  Logs in a user using their email/phone and password. Returns a JWT token that should be stored in a cookie.

- **POST /api/users/logout**  
  Logs out the user by clearing the JWT token from the cookie.

### Profile Management

- **GET /profile**  
  Retrieves the profile of the authenticated user. This route is protected and requires the user to be logged in (JWT token in cookies).

## Error Handling

The API uses custom error handling. If an error occurs, the API will return an appropriate response with the following structure:

```json
{
  "status": "fail",
  "message": "Error message",
  "code": 400
}
```

## Security

- All sensitive routes are protected using **JWT** authentication.
- Tokens are stored in **HTTP-only cookies** to prevent XSS attacks.


---

### Notes

- If you face any issues or have questions, feel free to open an issue on the GitHub repository.
- Make sure to replace sensitive data like `JWT_SECRET_KEY` with your own values in production.
