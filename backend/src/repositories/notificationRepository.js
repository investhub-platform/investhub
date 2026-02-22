import Notification from "../models/Notification.js";

export const create = (payload) => Notification.create(payload);

export const listForUser = async ({ userId, unreadOnly = false, page = 1, limit = 20 }) => {
  const filter = { recipientUserId: userId, deletedUtc: null, status: "active" };
  if (unreadOnly) filter.isRead = false;

  const skip = (page - 1) * limit;

  const items = await Notification.find(filter)
    .sort({ createdUtc: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Notification.countDocuments(filter);
  return { items, total };
};

export const countUnreadForUser = (userId) =>
  Notification.countDocuments({ recipientUserId: userId, isRead: false, deletedUtc: null, status: "active" });

export const markReadByIdForUser = async ({ notificationId, userId }) => {
  return Notification.findOneAndUpdate(
    { _id: notificationId, recipientUserId: userId, deletedUtc: null, status: "active" },
    { $set: { isRead: true, updatedUtc: new Date(), updatedBy: userId } },
    { new: true }
  ).lean();
};

export const markAllReadForUser = async ({ userId }) => {
  return Notification.updateMany(
    { recipientUserId: userId, isRead: false, deletedUtc: null, status: "active" },
    { $set: { isRead: true, updatedUtc: new Date(), updatedBy: userId } }
  );
};

export const softDeleteByIdForUser = async ({ notificationId, userId }) => {
  return Notification.findOneAndUpdate(
    { _id: notificationId, recipientUserId: userId, deletedUtc: null, status: "active" },
    { $set: { deletedUtc: new Date(), deletedBy: userId, status: "deleted", updatedUtc: new Date(), updatedBy: userId } },
    { new: true }
  ).lean();
};
