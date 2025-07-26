/**
 * Middleware for authenticating admin requests using JWT.
 * Verifies the provided token in the request headers and allows access if valid.
 *
 * @module middlewares/authAdmin
 */
import jwt from "jsonwebtoken";

/**
 * Authenticates admin requests by verifying the JWT token in the headers.
 * - If the token is missing or invalid, responds with 401 Unauthorized or 500 Internal Server Error.
 * - If valid, proceeds to the next middleware or route handler.
 *
 * @function
 * @param {import('express').Request} req - Express request object (expects 'token' in headers)
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {void}
 */
const authAdmin = (req, res, next) => {
  try {
    const { token } = req.headers;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized access" });
    }
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    if (token_decode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ message: "Unauthorized access" });
    }
    next();
  } catch (error) {
    console.error("Error during admin authentication:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default authAdmin;
