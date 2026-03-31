// src/features/notifications/api.js
import axios from "axios";

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
  axios.get(BASE_URL, { params, ...authConfig() });

// Get unread count
export const fetchUnreadCount = () =>
  axios.get(`${BASE_URL}/unread-count`, authConfig());

// Mark single as read
export const markAsRead = (id) =>
  axios.patch(`${BASE_URL}/${id}/read`, null, authConfig());

// Mark all as read
export const markAllAsRead = () =>
  axios.patch(`${BASE_URL}/read-all`, null, authConfig());

// Delete notification
export const deleteNotification = (id) =>
  axios.delete(`${BASE_URL}/${id}`, authConfig());