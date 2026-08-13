export function sanitizeForLog(text) {
  return Array.from(String(text), (ch) => (ch.charCodeAt(0) < 0x20 ? " " : ch)).join("");
}
