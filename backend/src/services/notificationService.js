import AppError from "../utils/AppError.js";
import * as notificationRepo from "../repositories/notificationRepository.js";
import * as userRepo from "../repositories/userRepository.js";
import { sendEmail } from "./emailService.js";

export const notifyUser = async ({
  recipientUserId,
  type,
  title,
  message,
  relatedId = null,
  actionUrl = null,
  startupId = null,
  createdBy = null,
}) => {
  const user = await userRepo.findById(recipientUserId);
  if (!user) throw new AppError("Recipient user not found", 404);

  // Email (if enabled)
  if (user.preferences?.notificationEmail) {
    await sendEmail({
      to: user.email,
      subject: `[InvestHub] ${title}`,
      html: `<h3>${title}</h3><p>${message}</p>${actionUrl ? `<p>Open: ${actionUrl}</p>` : ""}`,
    });
  }

  // In-app store (if enabled)
  if (!user.preferences?.notificationInApp) {
    return { stored: false };
  }

  const doc = await notificationRepo.create({
    recipientUserId,
    type,
    title,
    message,
    relatedId,
    actionUrl,
    startupId,
    createdUtc: new Date(),
    createdBy,
    updatedUtc: new Date(),
    updatedBy: createdBy,
    status: "active",
  });

  return { stored: true, id: doc._id.toString() };
};

export const getMyNotifications = async ({ userId, page = 1, limit = 20, unreadOnly = false }) => {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(50, Math.max(1, Number(limit) || 20));

  const [{ items, total }, unreadCount] = await Promise.all([
    notificationRepo.listForUser({ userId, unreadOnly, page: safePage, limit: safeLimit }),
    notificationRepo.countUnreadForUser(userId),
  ]);

  return {
    items,
    page: safePage,
    limit: safeLimit,
    total,
    unreadCount,
  };
};

export const getUnreadCount = async ({ userId }) => {
  const count = await notificationRepo.countUnreadForUser(userId);
  return { count };
};

export const markRead = async ({ userId, notificationId }) => {
  const updated = await notificationRepo.markReadByIdForUser({ userId, notificationId });
  if (!updated) throw new AppError("Notification not found", 404);
  return { message: "Marked as read" };
};

export const markAllRead = async ({ userId }) => {
  await notificationRepo.markAllReadForUser({ userId });
  return { message: "All notifications marked as read" };
};

export const deleteNotification = async ({ userId, notificationId }) => {
  const deleted = await notificationRepo.softDeleteByIdForUser({ userId, notificationId });
  if (!deleted) throw new AppError("Notification not found", 404);
  return { message: "Notification deleted" };
};
