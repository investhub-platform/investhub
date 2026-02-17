import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";

export const requireAuth = (req, _res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new AppError("Unauthorized: Missing access token", 401);
    }

    const token = header.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    req.user = {
      id: payload.sub,
      roles: payload.roles || [],
    };

    next();
  } catch (err) {
    next(new AppError("Unauthorized: Invalid/Expired access token", 401));
  }
};
