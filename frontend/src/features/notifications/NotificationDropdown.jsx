import { useEffect, useState, useRef } from "react";
import { Bell, X, CheckCheck, Inbox } from "lucide-react";
import {
  fetchNotifications,
  fetchUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "./api";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { motion, AnimatePresence } from "framer-motion";

dayjs.extend(relativeTime);

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const nav = useNavigate();

  // Load notifications
  const loadNotifications = async () => {
    try {
      const res = await fetchNotifications();
      setNotifications(res.data.data.items);
    } catch (err) {
      console.error("Notification load error:", err);
    }
  };

  // Load unread count
  const loadUnread = async () => {
    try {
      const res = await fetchUnreadCount();
      setUnreadCount(res.data.data.count);
    } catch (err) {
      console.error("Unread count error:", err);
    }
  };

  // Initial load + auto refresh
  useEffect(() => {
    const refresh = () => {
      void loadNotifications();
      void loadUnread();
    };

    const initialTimeout = window.setTimeout(refresh, 0);
    const interval = window.setInterval(refresh, 10000); // every 10s

    return () => {
      window.clearTimeout(initialTimeout);
      window.clearInterval(interval);
    };
  }, []);

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Toggle dropdown
  const handleOpen = async () => {
    setOpen((prev) => !prev);
    if (!open) {
      await loadNotifications();
      await loadUnread();
    }
  };

  // Mark as read + navigate
  const handleRead = async (id, actionUrl) => {
    try {
      await markAsRead(id);

      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
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

  // Delete notification (Subtle dismissal)
  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Prevent triggering the read/navigate action
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      // Re-calculate unread count just in case an unread one was deleted
      loadUnread();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // Mark all read
  const handleMarkAll = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Mark all error:", err);
    }
  };

  return (
    <div className="relative flex items-center" ref={dropdownRef}>
      {/* 🔔 Bell Trigger */}
      <button
        onClick={handleOpen}
        className={`relative p-2.5 rounded-full border transition-all duration-300 ${
          open 
            ? "bg-blue-500/10 border-blue-500/30 text-blue-400" 
            : "bg-white/5 border-white/5 text-slate-300 hover:text-white hover:bg-white/10"
        }`}
      >
        <Bell className="w-5 h-5" />

        {/* Premium glowing dot instead of a massive red bubble */}
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-[#020617] shadow-[0_0_8px_#3b82f6]" />
        )}
      </button>

      {/* 📩 Dropdown Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed left-4 right-4 top-[85px] sm:absolute sm:top-[calc(100%+12px)] sm:left-auto sm:right-0 sm:w-[400px] max-h-[80vh] sm:max-h-[500px] flex flex-col bg-[#0B0D10]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-center px-5 py-4 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <span className="text-base text-white font-bold tracking-tight">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 text-xs font-bold">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <button
                onClick={handleMarkAll}
                disabled={unreadCount === 0}
                className="text-xs font-semibold text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:hover:text-slate-400"
              >
                <CheckCheck className="w-4 h-4" />
                Mark all read
              </button>
            </div>

            {/* List */}
            <div className="overflow-y-auto overscroll-contain flex-1">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 border border-white/5">
                    <Inbox className="w-5 h-5 text-slate-500" />
                  </div>
                  <p className="text-sm font-bold text-white mb-1">You're all caught up!</p>
                  <p className="text-xs text-slate-400">No new notifications right now.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {notifications.map((n) => (
                    <div
                      key={n._id}
                      className="group relative flex items-start gap-4 p-5 hover:bg-white/[0.03] transition-colors cursor-pointer"
                      onClick={() => handleRead(n._id, n.actionUrl)}
                    >
                      {/* Unread Glow Indicator */}
                      {!n.isRead && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full shadow-[0_0_10px_#3b82f6]" />
                      )}

                      {/* Notification Content */}
                      <div className="flex-1 min-w-0 pr-6">
                        <h4 className={`text-sm font-bold truncate mb-1 ${n.isRead ? "text-slate-300" : "text-white"}`}>
                          {n.title}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                        <span className="text-[10px] font-medium text-slate-500 mt-2.5 block uppercase tracking-wider">
                          {dayjs(n.createdUtc).fromNow()}
                        </span>
                      </div>

                      {/* Subtle Dismiss Button (Replaces the big red trash can) */}
                      <button
                        onClick={(e) => handleDelete(e, n._id)}
                        className="absolute right-4 top-5 p-1.5 text-slate-500 hover:text-white hover:bg-white/10 rounded-md transition-all opacity-0 group-hover:opacity-100 sm:flex hidden"
                        title="Dismiss"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      
                      {/* Always show dismiss on mobile since there's no hover */}
                      <button
                        onClick={(e) => handleDelete(e, n._id)}
                        className="absolute right-4 top-5 p-1.5 text-slate-500 hover:text-white rounded-md sm:hidden flex"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Optional Footer Fade */}
            <div className="h-4 w-full bg-gradient-to-t from-[#0B0D10]/95 to-transparent absolute bottom-0 pointer-events-none" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}