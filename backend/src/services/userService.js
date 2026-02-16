import AppError from "../utils/AppError.js";
import * as userRepo from "../repositories/userRepository.js";

export const getMe = async (userId) => {
  const user = await userRepo.findPublicById(userId);
  if (!user) throw new AppError("User not found", 404);
  return user;
};

export const updateMe = async (userId, payload) => {
  const allowed = ["profile", "preferences", "name"];
  const safePayload = {};

  for (const k of allowed) {
    if (payload[k] !== undefined) safePayload[k] = payload[k];
  }

  safePayload.updatedUtc = new Date();
  safePayload.updatedBy = userId;

  const user = await userRepo.updateById(userId, safePayload);
  if (!user) throw new AppError("User not found", 404);

  // return safe user
  return await userRepo.findPublicById(userId);
};

export const deleteMe = async (userId) => {
  const user = await userRepo.findById(userId);
  if (!user) throw new AppError("User not found", 404);

  user.status = "deleted";
  user.deletedUtc = new Date();
  user.deletedBy = userId;
  user.updatedUtc = new Date();
  user.updatedBy = userId;

  await userRepo.save(user);
  return true;
};
