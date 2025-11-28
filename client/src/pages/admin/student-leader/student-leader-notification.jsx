import axios from "axios";
import { API_ROUTER } from "../../../App";
import { useEffect, useState, useCallback } from "react";
import { Bell, Loader2, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

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
    // Open popup
    setSelectedNotification(notif);
  };

  const closePopup = () => {
    setSelectedNotification(null);
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

  return (
    <>
      <div className="p-6 flex flex-col w-full h-full" style={{ backgroundColor: '#F5F5F5' }}>
        <Card className="flex flex-col h-full bg-white">
          <CardContent className="p-6 flex flex-col h-full">
            <div className="flex justify-between w-full mb-6">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Bell className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="font-bold text-lg">Notifications</h2>
              </div>

              <div className="flex items-center gap-2">
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
              <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {notifications.map((notif) => (
                  <div
                    key={notif._id}
                    onClick={() => handleNotificationClick(notif)}
                    className="group relative p-4 rounded-lg border bg-white border-gray-200 hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    {/* Type badge and timestamp */}
                    <div className="flex justify-between items-center mb-2">
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
                    <p className="text-sm text-gray-800 whitespace-pre-line line-clamp-2">
                      {notif.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

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
        <Dialog open={!!selectedNotification} onOpenChange={closePopup}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden p-0">
            {/* Header */}
            <DialogHeader className="px-6 py-4 border-b">
              <DialogTitle className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-blue-600" />
                Notification Details
              </DialogTitle>
            </DialogHeader>

            {/* Content */}
            <div className="px-6 overflow-y-auto max-h-[calc(80vh-180px)]">
              {/* Type badge */}
              <div className="flex items-center justify-between mb-4">
                <Badge
                  variant="secondary"
                  className={getNotificationTypeColor(selectedNotification.type)}
                >
                  {selectedNotification.type}
                </Badge>
              </div>

              {/* Message */}
              <div className="mb-6">
                <p className="text-base text-gray-800 whitespace-pre-line leading-relaxed">
                  {selectedNotification.message}
                </p>
              </div>

              {/* Timestamp */}
              <div className="text-sm text-gray-500 ">
                <span className="font-medium">Received:</span>{" "}
                {formatFullTimestamp(selectedNotification.createdAt)}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 px-6 py-4 border-t bg-gray-50">
              <Button
                onClick={closePopup}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
