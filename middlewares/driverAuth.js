import jwt from "jsonwebtoken";

const isAuthenticatedDriver = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "User not authenticated",
        success: false,
      });
    }

    const decoded = jwt.verify(token, process.env.SECRETE_KEY);

    if (!decoded) {
      return res.status(401).json({
        message: "Invalid token",
        success: false,
      });
    }

    req.id = decoded.driverId; // Ensure this matches the `loginDriver` token payload
    req.role = decoded.role; // Optional: If you need role-based access

    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({
      message: "Authentication failed",
      success: false,
    });
  }
};

export default isAuthenticatedDriver;
