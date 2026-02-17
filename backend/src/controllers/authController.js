import * as authService from "../services/authService.js";

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === "true",
  sameSite: process.env.COOKIE_SECURE === "true" ? "none" : "lax",
  path: "/api/v1/auth", // cookie only sent to auth endpoints (optional but nice)
});

export const register = async (req, res, next) => {
  try {
    const data = await authService.register(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { accessToken, refreshToken, user } = await authService.login(req.body);

    res.cookie("refreshToken", refreshToken, cookieOptions());

    res.json({
      success: true,
      data: { accessToken, user },
    });
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    const data = await authService.refresh({ refreshToken });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    // If you have auth middleware, you can read req.user.id.
    // For now, just clear cookie and (optional) clear token in DB later.
    res.clearCookie("refreshToken", { path: "/api/v1/auth" });
    res.json({ success: true, message: "Logged out" });
  } catch (err) {
    next(err);
  }
};

export const verifyEmailOtp = async (req, res, next) => {
  try {
    const data = await authService.verifyEmailOtp(req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const data = await authService.forgotPassword(req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const data = await authService.resetPassword(req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
 
export const resendEmailOtp = async (req, res, next) => {
  try {
    const data = await authService.resendEmailOtp(req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
