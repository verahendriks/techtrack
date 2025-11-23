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

export function kmhToBeaufort(kmh) {
  if (kmh == null) return 0;
  if (kmh < 1) return 0;
  if (kmh <= 5) return 1;
  if (kmh <= 11) return 2;
  if (kmh <= 19) return 3;
  if (kmh <= 28) return 4;
  if (kmh <= 38) return 5;
  if (kmh <= 49) return 6;
  if (kmh <= 61) return 7;
  if (kmh <= 74) return 8;
  if (kmh <= 88) return 9;
  if (kmh <= 102) return 10;
  if (kmh <= 117) return 11;
  if (kmh > 117) return 12;
}