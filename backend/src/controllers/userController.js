import * as userService from "../services/userService.js";

export const getMe = async (req, res, next) => {
  try {
    const data = await userService.getMe(req.user.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const updateMe = async (req, res, next) => {
  try {
    const data = await userService.updateMe(req.user.id, req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const deleteMe = async (req, res, next) => {
  try {
    await userService.deleteMe(req.user.id);
    res.json({ success: true, message: "Account deleted" });
  } catch (err) {
    next(err);
  }
};
