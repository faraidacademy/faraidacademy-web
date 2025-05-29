// src/utils/date.ts
export function formatDate(dateString: string | undefined): string {
  if (!dateString) {
    return "Unknown";
  }
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
