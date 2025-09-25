import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // e.g. http://192.168.1.42:5050/api
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
