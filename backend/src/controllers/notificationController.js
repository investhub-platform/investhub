import * as notificationService from "../services/notificationService.js";

export const listMyNotifications = async (req, res, next) => {
  try {
    const { page, limit, unreadOnly } = req.query;

    const data = await notificationService.getMyNotifications({
      userId: req.user.id,
      page,
      limit,
      unreadOnly: unreadOnly === "true",
    });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const unreadCount = async (req, res, next) => {
  try {
    const data = await notificationService.getUnreadCount({ userId: req.user.id });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const markRead = async (req, res, next) => {
  try {
    const data = await notificationService.markRead({
      userId: req.user.id,
      notificationId: req.params.id,
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const markAllRead = async (req, res, next) => {
  try {
    const data = await notificationService.markAllRead({ userId: req.user.id });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const deleteOne = async (req, res, next) => {
  try {
    const data = await notificationService.deleteNotification({
      userId: req.user.id,
      notificationId: req.params.id,
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
