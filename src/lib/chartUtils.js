// Formatteert de tijd
export function formatDuration(seconds) {
  if (seconds == null || seconds === "" || Number.isNaN(Number(seconds))) return "0u 0m";
  const secs = Math.max(0, Math.floor(Number(seconds)));
  const hours = Math.floor(secs / 3600);
  const minutes = Math.floor((secs % 3600) / 60);
  return `${hours}u ${minutes}m`;
}

// Formatteert de datum
export function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("nl-NL", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}