// src/features/notifications/api.js
import api from "@/lib/axios";


// Use Vite environment variable
const BASE_URL = import.meta.env.VITE_API_BASE + "/api/v1/notifications";

// Helper to get token from localStorage
const getToken = () => localStorage.getItem("accessToken");

// Axios config with Authorization header
const authConfig = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

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