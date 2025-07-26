/**
 * Middleware for authenticating user requests using JWT.
 * Verifies the provided token in the request headers and attaches the user ID to the request object if valid.
 *
 * @module middlewares/authUser
 */
import jwt from "jsonwebtoken";

/**
 * Authenticates user requests by verifying the JWT token in the headers.
 * - If the token is missing, responds with 401 Unauthorized.
 * - If the token is invalid, responds with 500 Internal Server Error.
 * - If valid, attaches the user ID to req.user and proceeds to the next middleware or route handler.
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
    if (req.body !== undefined) {
      req.body.userId = token_decode.id;
    } else {
      req.body = { userId: token_decode.id };
    }
    next();
  } catch (error) {
    console.error("Error during admin authentication:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default authAdmin;
