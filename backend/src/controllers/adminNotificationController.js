import * as notificationService from "../services/notificationService.js";

export const createNotification = async (req, res, next) => {
  try {
    const { userId, type, title, message, relatedId, actionUrl, startupId } = req.body;

    const data = await notificationService.notifyUser({
      recipientUserId: userId,
      type,
      title,
      message,
      relatedId: relatedId || null,
      actionUrl: actionUrl || null,
      startupId: startupId || null,
      createdBy: req.user.id,
    });

    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
