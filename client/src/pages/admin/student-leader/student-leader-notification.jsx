import axios from "axios";
import { API_ROUTER } from "../../../App";
import { useEffect, useState, useCallback } from "react";
import { Bell, CheckCircle, Loader2, RefreshCw, X } from "lucide-react";

export function StudentLeaderNotification({ orgData }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const fetchNotifications = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setIsRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const { data } = await axios.get(
          `${API_ROUTER}/OrganizationNotification/${orgData._id}`,
          { withCredentials: true }
        );

        if (data?.success) {
          setNotifications(data.notifications);
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError("Failed to load notifications. Please try again.");
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [orgData._id]
  );

  const handleNotificationClick = async (notif) => {
    // Mark as read when clicked if not already read
    if (!notif.read) {
      await markAsRead(notif._id);
    }
    // Open popup
    setSelectedNotification(notif);
  };

  const closePopup = () => {
    setSelectedNotification(null);
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(
        `${API_ROUTER}/OrganizationNotification/${notificationId}/read`,
        {},
        { withCredentials: true }
      );

      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch(
        `${API_ROUTER}/OrganizationNotification/${orgData._id}/read-all`,
        {},
        { withCredentials: true }
      );

      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true }))
      );
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const deleteNotification = async (notificationId, e) => {
    e.stopPropagation();
    try {
      await axios.delete(
        `${API_ROUTER}/OrganizationNotification/${notificationId}`,
        { withCredentials: true }
      );

      setNotifications((prev) =>
        prev.filter((notif) => notif._id !== notificationId)
      );

      // Close popup if deleted notification is currently open
      if (selectedNotification?._id === notificationId) {
        closePopup();
      }
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  const formatTimestamp = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return "Just now";
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  };

  const formatFullTimestamp = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getNotificationTypeColor = (type) => {
    const colors = {
      info: "text-blue-600 bg-blue-100",
      success: "text-green-600 bg-green-100",
      warning: "text-yellow-600 bg-yellow-100",
      error: "text-red-600 bg-red-100",
      default: "text-gray-600 bg-gray-100",
    };
    return colors[type?.toLowerCase()] || colors.default;
  };

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <div className="p-4 flex flex-col border rounded-lg w-full h-full bg-white shadow-md">
        <div className="flex justify-between w-full mb-6">
          <div className="flex items-center gap-2 ">
            <div className="relative">
              <Bell className="w-5 h-5 text-blue-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            <h2 className="font-bold text-lg">Notifications</h2>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={() => fetchNotifications(true)}
              disabled={isRefreshing}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
              aria-label="Refresh notifications"
            >
              <RefreshCw
                className={`w-4 h-4 text-gray-600 ${
                  isRefreshing ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-sm text-red-600 mb-3">{error}</p>
            <button
              onClick={() => fetchNotifications()}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Try again
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-2 h-full overflow-y-auto pr-2 custom-scrollbar">
            {notifications.map((notif) => (
              <div
                key={notif._id}
                onClick={() => handleNotificationClick(notif)}
                className={`group relative p-3 rounded-lg border transition-all cursor-pointer ${
                  notif.read
                    ? "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    : "bg-blue-50 border-blue-200 hover:bg-blue-100"
                }`}
              >
                {/* Delete button */}
                <button
                  onClick={(e) => deleteNotification(notif._id, e)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white rounded-full"
                  aria-label="Delete notification"
                >
                  <X className="w-3 h-3 text-gray-500 hover:text-red-600" />
                </button>

                {/* Type badge and timestamp */}
                <div className="flex justify-between items-center mb-2 pr-6">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${getNotificationTypeColor(
                      notif.type
                    )}`}
                  >
                    {notif.type}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {formatTimestamp(notif.createdAt)}
                  </span>
                </div>

                {/* Message */}
                <p className="text-sm text-gray-800 whitespace-pre-line mb-2 line-clamp-2">
                  {notif.message}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  {notif.read ? (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle className="w-3 h-3" />
                      <span>Read</span>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notif._id);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <style>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
        `}</style>
      </div>

      {/* Popup Modal */}
      {selectedNotification && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-2xl flex items-center justify-center z-50 p-4"
          onClick={closePopup}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">
                  Notification Details
                </h3>
              </div>
              <button
                onClick={closePopup}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Type badge */}
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${getNotificationTypeColor(
                    selectedNotification.type
                  )}`}
                >
                  {selectedNotification.type}
                </span>
                {selectedNotification.read ? (
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>Read</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-sm text-blue-600">
                    <Bell className="w-4 h-4" />
                    <span>Unread</span>
                  </div>
                )}
              </div>

              {/* Message */}
              <div className="mb-6">
                <p className="text-base text-gray-800 whitespace-pre-line leading-relaxed">
                  {selectedNotification.message}
                </p>
              </div>

              {/* Timestamp */}
              <div className="text-sm text-gray-500 mb-6">
                <span className="font-medium">Received:</span>{" "}
                {formatFullTimestamp(selectedNotification.createdAt)}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                {!selectedNotification.read && (
                  <button
                    onClick={() => {
                      markAsRead(selectedNotification._id);
                      closePopup();
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Mark as Read
                  </button>
                )}
                <button
                  onClick={(e) => {
                    deleteNotification(selectedNotification._id, e);
                  }}
                  className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
                >
                  Delete
                </button>
                <button
                  onClick={closePopup}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
