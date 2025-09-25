import axios from "axios";
import { useEffect, useState } from "react";
import { API_ROUTER } from "../../../../../App";

export function SduHistoryPresidents({ orgId }) {
  const [presidents, setPresidents] = useState([]);

  useEffect(() => {
    const fetchPresident = async () => {
      try {
        const res = await axios.get(
          `${API_ROUTER}/getPreviousPresident/${orgId}`
        );

        // Store data directly
        setPresidents(res.data);
      } catch (error) {
        console.error("Failed to fetch president data", error);
      }
    };

    fetchPresident();
  }, [orgId]);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <div>
      <h2 className="text-lg font-bold mb-2">Previous Presidents</h2>
      <ul className="space-y-2">
        {presidents.map((p) => (
          <li
            key={p._id}
            className="p-3 border rounded-md shadow-sm bg-white flex justify-between"
          >
            <span>{p.name}</span>
            <span className="text-sm text-gray-600">
              {formatDate(p.createdAt)} - {formatDate(p.updatedAt)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
