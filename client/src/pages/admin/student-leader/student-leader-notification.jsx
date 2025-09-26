import { useNotifications } from "../../../api/home_page_api";

export function StudentLeaderNotification({
  userId = "68d59b4fbcfb5416f3af63c1",
}) {
  
  const { notifications } = useNotifications(userId);

  return (
    <div className="p-4 border rounded-md w-80">
      <h2 className="font-bold text-lg mb-2">🔔 Notifications</h2>
      <ul>
        {notifications.map((n) => (
          <li key={n._id} className="border-b py-2 text-sm">
            {n.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
