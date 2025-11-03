import axios from "axios";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { API_ROUTER } from "../App";

export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!userId) return;

    // Fetch existing notifications (use configured API URL instead of hard-coded LAN IP)
    axios
      .get(`${import.meta.env.VITE_API_URL}/notifications`, {
        params: { userId },
        withCredentials: true, // optional now, but fine to keep
      })
      .then((res) => {
        setNotifications(res.data);
      })
      .catch((err) => console.error("Fetch notifications error:", err));
    // Connect to WebSocket with userId
    // Socket server should be the server origin (not the /api path)
    const socket = io(import.meta.env.VITE_API_URL, {
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
