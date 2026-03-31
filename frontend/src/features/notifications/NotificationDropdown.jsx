import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import {
  fetchNotifications,
  fetchUnreadCount,
  markAsRead,
  markAllAsRead,
} from "./api";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const nav = useNavigate();

  // Fetch notifications + unread count
  const fetchData = async () => {
    try {
      const [notifRes, unreadRes] = await Promise.all([
        fetchNotifications(),
        fetchUnreadCount(),
      ]);

      setNotifications(notifRes.data.data.items || []);
      setUnreadCount(unreadRes.data.data.count || 0);
    } catch (err) {
      console.error("Notification fetch error:", err);
    }
  };

  // Initial load + auto refresh
  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, 10000);

    return () => clearInterval(interval);
  }, []);

  // Toggle dropdown (fixed)
  const handleOpen = async () => {
    const newState = !open;
    setOpen(newState);

    if (newState) {
      await fetchData();
    }
  };

  // Mark as read + navigate
  const handleRead = async (id, actionUrl) => {
    try {
      await markAsRead(id);

      setNotifications((prev) =>
        prev.map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        )
      );

      setUnreadCount((prev) => Math.max(prev - 1, 0));

      if (actionUrl) {
        nav(actionUrl);
        setOpen(false);
      }
    } catch (err) {
      console.error("Mark read error:", err);
    }
  };

  // Mark all read
  const handleMarkAll = async () => {
    try {
      await markAllAsRead();

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );

      setUnreadCount(0);
    } catch (err) {
      console.error("Mark all error:", err);
    }
  };

  return (
    <div className="relative">
      {/* 🔔 Bell */}
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 transition"
      >
        <Bell className="w-5 h-5 text-white" />

        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-[10px] px-1 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* 📩 Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-[400px] overflow-y-auto bg-[#0B0D10] border border-white/10 rounded-xl shadow-xl p-2 z-50">

          {/* Header */}
          <div className="flex justify-between items-center px-2 py-1">
            <span className="text-sm text-white font-semibold">
              Notifications
            </span>

            <button
              onClick={handleMarkAll}
              className="text-xs text-blue-400 hover:underline flex items-center gap-1"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all
            </button>
          </div>

          <div className="h-px bg-white/10 my-2" />

          {/* List */}
          {notifications.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-4">
              No notifications
            </p>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                className={`p-3 rounded-lg mb-2 cursor-pointer ${
                  n.isRead
                    ? "bg-white/5"
                    : "bg-blue-500/10 border border-blue-500/30"
                }`}
              >
                {/* Click area */}
                <div
                  onClick={() => handleRead(n._id, n.actionUrl)}
                  className="flex flex-col"
                >
                  <span className="text-sm font-semibold text-white">
                    {n.title}
                  </span>

                  <span className="text-xs text-gray-400">
                    {n.message}
                  </span>

                  <span className="text-[10px] text-gray-500 mt-1">
                    {dayjs(n.createdUtc).fromNow()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}