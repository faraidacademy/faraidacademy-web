// src/utils/formatting.ts
export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) {
    return "";
  }
  return num.toLocaleString("de-DE");
}
