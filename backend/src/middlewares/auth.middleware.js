import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";
import User from "../models/User.js";

export const requireAuth = async (req, _res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new AppError("Unauthorized: Missing access token", 401);
    }

    const token = header.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Load user from DB to get full details (name, email)
    const user = await User.findById(payload.sub).lean();
    if (!user) {
      throw new AppError("User not found", 401);
    }

    req.user = {
      id: String(user._id),
      name: user.name,
      email: user.email,
      roles: payload.roles || user.roles || [],
    };

    next();
  } catch (err) {
    next(new AppError("Unauthorized: Invalid/Expired access token", 401));
  }
};

// Alias for backward compatibility with wallet routes
export const protect = requireAuth;

export default { requireAuth, protect };
