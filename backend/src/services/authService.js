import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import AppError from "../utils/AppError.js";
import * as userRepo from "../repositories/userRepository.js";
import { requireFields, validateEmail, validatePassword } from "../utils/validators.js";
import { sendEmail } from "./emailService.js";


const signAccessToken = (user) => {
  return jwt.sign(
    { sub: user._id.toString(), roles: user.roles },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES || "15m" }
  );
};

const signRefreshToken = (user) => {
  return jwt.sign(
    { sub: user._id.toString() },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES || "7d" }
  );
};

const sha256 = (value) =>
  crypto.createHash("sha256").update(value).digest("hex");

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();


export const register = async ({ name, email, password }) => {
  requireFields({ name, email, password }, ["name", "email", "password"]);
  validateEmail(email);
  validatePassword(password);

  const existing = await userRepo.findByEmail(email);
  if (existing) throw new AppError("User already exists", 409);

  const passwordHash = await bcrypt.hash(password, 10);

  const otp = generateOtp();
  const otpHash = sha256(otp);

  const user = await userRepo.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    roles: ["user"],
    status: "pending_email_verification",
    emailOtpHash: otpHash,
    emailOtpExpiryUtc: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
  });

  await sendEmail({
    to: user.email,
    subject: "Verify your InvestHub account",
    html: `<h3>Your OTP: ${otp}</h3><p>Valid for 10 minutes.</p>`,
  });

  return {
    id: user._id,
    email: user.email,
    status: user.status,
  };
};


export const login = async ({ email, password }) => {
  requireFields({  email, password }, [  "email", "password"]);
  validateEmail(email);
  validatePassword(password);

  if (!email || !password) throw new AppError("Email and password are required", 400);

  const user = await userRepo.findByEmail(email);
  if (!user) throw new AppError("Invalid credentials", 401);

  if (user.status === "suspended") throw new AppError("Account suspended", 403);
  if (user.status === "deleted") throw new AppError("Account deleted", 403);

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new AppError("Invalid credentials", 401);

  // (Optional policy) block login until email verified:
  // if (user.status !== "active") throw new AppError("Please verify your email", 403);

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  // store refresh token hash
  user.refreshTokenHash = sha256(refreshToken);
  user.updatedUtc = new Date();
  await userRepo.save(user);

  return {
    accessToken,
    refreshToken, // controller will put it in httpOnly cookie, not in JSON
    user: { id: user._id, name: user.name, email: user.email, roles: user.roles, status: user.status },
  };
};

export const refresh = async ({ refreshToken }) => {
  if (!refreshToken) throw new AppError("No refresh token", 401);

  let payload;
  try {
    payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new AppError("Invalid refresh token", 401);
  }

  const user = await userRepo.findById(payload.sub);
  if (!user || !user.refreshTokenHash) throw new AppError("Invalid refresh token", 401);

  if (sha256(refreshToken) !== user.refreshTokenHash) {
    throw new AppError("Refresh token mismatch", 401);
  }

  const newAccessToken = signAccessToken(user);
  return { accessToken: newAccessToken };
};

export const logout = async ({ userId }) => {
  const user = await userRepo.findById(userId);
  if (user) {
    user.refreshTokenHash = null;
    user.updatedUtc = new Date();
    await userRepo.save(user);
  }
  return true;
};

export const verifyEmailOtp = async ({ email, otp }) => {
  requireFields({ email, otp }, ["email", "otp"]);

  const user = await userRepo.findByEmail(email);
  if (!user) throw new AppError("User not found", 404);

  if (!user.emailOtpHash || !user.emailOtpExpiryUtc)
    throw new AppError("No OTP pending", 400);

  if (user.emailOtpExpiryUtc < new Date())
    throw new AppError("OTP expired", 400);

  if (sha256(otp) !== user.emailOtpHash)
    throw new AppError("Invalid OTP", 400);

  user.status = "active";
  user.emailOtpHash = null;
  user.emailOtpExpiryUtc = null;
  user.updatedUtc = new Date();

  await userRepo.save(user);

  return { message: "Email verified successfully" };
};

