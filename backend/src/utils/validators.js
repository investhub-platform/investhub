import AppError from "./AppError.js";

export const requireFields = (obj, fields) => {
  for (const f of fields) {
    if (!obj?.[f] || String(obj[f]).trim() === "") {
      throw new AppError(`${f} is required`, 400);
    }
  }
};

export const isEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const validateEmail = (email) => {
  if (!isEmail(email)) throw new AppError("Invalid email format", 400);
};

export const validatePassword = (pwd) => {
  // Simple strong rule (you can tune later)
  if (typeof pwd !== "string" || pwd.length < 8) {
    throw new AppError("Password must be at least 8 characters", 400);
  }
};
