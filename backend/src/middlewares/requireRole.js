import AppError from "../utils/AppError.js";

export const requireRole = (role) => (req, _res, next) => {
  const roles = req.user?.roles || [];
  if (!roles.includes(role)) return next(new AppError("Forbidden", 403));
  next();
};
