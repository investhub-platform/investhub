import * as userRepo from "../repositories/userRepository.js";
import AppError from "../utils/AppError.js";

export const listUsers = async (req, res, next) => {
  try {
    const users = await userRepo.list({});
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await userRepo.findPublicById(req.params.id);
    if (!user) throw new AppError("User not found", 404);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const allowed = ["roles", "status"];
    const updateData = {};

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    }

    updateData.updatedUtc = new Date();
    updateData.updatedBy = req.user.id;

    const user = await userRepo.updateById(req.params.id, updateData);
    if (!user) throw new AppError("User not found", 404);

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await userRepo.findById(req.params.id);
    if (!user) throw new AppError("User not found", 404);

    user.status = "deleted";
    user.deletedUtc = new Date();
    user.deletedBy = req.user.id;
    user.updatedUtc = new Date();

    await user.save();

    res.json({ success: true, message: "User soft deleted" });
  } catch (err) {
    next(err);
  }
};
