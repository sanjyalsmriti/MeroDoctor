import jwt from "jsonwebtoken";

const authDoctor = (req, res, next) => {
  try {
    const { dtoken } = req.headers;
    if (!dtoken) {
      return res.status(401).json({ success: false, message: "Unauthorized access" });
    }
    
    const token_decode = jwt.verify(dtoken, process.env.JWT_SECRET);
    
    // Ensure req.body exists before setting properties
    if (!req.body) {
      req.body = {};
    }
    
    req.body.docId = token_decode.id;
    next();
  } catch (error) {
    console.error("Auth Doctor Error:", error);
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

export default authDoctor;