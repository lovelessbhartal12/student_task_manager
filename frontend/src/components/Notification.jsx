export default function Notification({ notification }) {
  if (!notification) {
    return null;
  }

  const isSuccess = notification.type === "success";

  return (
    <div
      className={`notification ${isSuccess ? "notification-success" : "notification-error"}`}
      role="status"
      aria-live="polite"
    >
      <span className="notification-icon">{isSuccess ? "\u2713" : "!"}</span>
      <span>{notification.message}</span>
    </div>
  );
}