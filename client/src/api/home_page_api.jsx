import axios from "axios";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { API_ROUTER } from "../App";

export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!userId) return;

    // Fetch existing notifications
    axios
      .get(`http://192.168.1.8:5050/notifications`, {
        params: { userId },
        withCredentials: true, // optional now, but fine to keep
      })
      .then((res) => {
        setNotifications(res.data);
      })
      .catch((err) => console.error("Fetch notifications error:", err));
    // Connect to WebSocket with userId

    const socket = io(API_ROUTER, {
      withCredentials: true,
      auth: { userId },
    });

    console.log("DUDUDU max verstappen");
    socket.on("notification", (notif) => {
      setNotifications((prev) => [notif, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  return { notifications };
}
