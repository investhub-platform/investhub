import { validationResult } from "express-validator";

export default function validateRequest(req, res, next) {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: result.array().map((error) => ({
        field: error.path,
        message: error.msg,
      })),
    });
  }

  next();
}