// src/features/notifications/api.js
import api from "@/lib/axios";

const BASE_URL = "/v1/notifications";

// Get notifications
export const fetchNotifications = (params) =>
  api.get(BASE_URL, { params });

// Get unread count
export const fetchUnreadCount = () =>
  api.get(`${BASE_URL}/unread-count`);

// Mark single as read
export const markAsRead = (id) =>
  api.patch(`${BASE_URL}/${id}/read`);

// Mark all as read
export const markAllAsRead = () =>
  api.patch(`${BASE_URL}/read-all`);

// Delete notification
export const deleteNotification = (id) =>
  api.delete(`${BASE_URL}/${id}`);