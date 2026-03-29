"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, Check, X } from "lucide-react";
import toast from "react-hot-toast";

interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fetchNotifications = () => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => {
        if (!d.error) {
          setNotifications(d.notifications || []);
          setUnreadCount(d.unreadCount || 0);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Tashqariga bosish — yopish
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      toast.error("Xatolik");
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "hozirgina";
    if (minutes < 60) return `${minutes} daq oldin`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} soat oldin`;
    const days = Math.floor(hours / 24);
    return `${days} kun oldin`;
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors"
      >
        <Bell className="w-5 h-5 text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800">Bildirishnomalar</h3>
            <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-slate-100">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center">
                <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400">Bildirishnomalar yo&apos;q</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors ${
                    !n.isRead ? "bg-blue-50/50" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!n.isRead ? "font-semibold text-slate-800" : "text-slate-600"}`}>
                        {n.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-slate-300 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.isRead && (
                      <button
                        onClick={() => markAsRead(n.id)}
                        className="shrink-0 p-1 rounded-lg hover:bg-blue-100 text-blue-500"
                        title="O'qildi deb belgilash"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
