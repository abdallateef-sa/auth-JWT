class AppError extends Error {
  constructor(message, statusCode, statusText) {
    super(message);
    this.statusCode = statusCode;
    this.statusText = statusText;
  }
}

export default AppError;
