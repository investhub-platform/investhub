import AppError from "../utils/AppError.js";
import * as userRepo from "../repositories/userRepository.js";

export const getMe = async (userId) => {
  const user = await userRepo.findPublicById(userId);
  if (!user) throw new AppError("User not found", 404);

  const now = new Date();
  const investorExpiry = user?.subscription?.investorProExpiresAt
    ? new Date(user.subscription.investorProExpiresAt)
    : null;
  const founderExpiry = user?.subscription?.founderProExpiresAt
    ? new Date(user.subscription.founderProExpiresAt)
    : null;

  const subscription = {
    investorProExpiresAt: investorExpiry,
    founderProExpiresAt: founderExpiry,
    isInvestorPro: Boolean(investorExpiry && investorExpiry > now),
    isFounderPro: Boolean(founderExpiry && founderExpiry > now),
    isAnyPro: Boolean((investorExpiry && investorExpiry > now) || (founderExpiry && founderExpiry > now)),
  };

  const plainUser = user.toObject ? user.toObject() : user;
  plainUser.subscription = subscription;
  return plainUser;
};

export const updateMe = async (userId, payload) => {
  const existing = await userRepo.findById(userId);
  if (!existing) throw new AppError("User not found", 404);

  const allowed = ["profile", "preferences", "name"];
  const safePayload = {};

  for (const k of allowed) {
    if (payload[k] !== undefined) safePayload[k] = payload[k];
  }

  // Merge nested objects so partial updates (like profilePictureUrl only) do not overwrite all profile/preferences fields.
  if (safePayload.profile) {
    const currentProfile = existing.profile?.toObject ? existing.profile.toObject() : existing.profile || {};
    safePayload.profile = { ...currentProfile, ...safePayload.profile };
  }

  if (safePayload.preferences) {
    const currentPrefs = existing.preferences?.toObject ? existing.preferences.toObject() : existing.preferences || {};
    safePayload.preferences = { ...currentPrefs, ...safePayload.preferences };
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
