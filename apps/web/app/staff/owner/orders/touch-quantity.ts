// Owner manual order limits: createOwnerOrder accepts 1–50 per line, 60 lines.
export const OWNER_LINE_MAX = 50;
export const OWNER_LINES_MAX = 60;
export function normalizeQuantityDigits(value: string): string {
  return value.replace(/[٠-٩۰-۹]/g, (digit) =>
    String(digit.charCodeAt(0) - (digit >= "۰" ? 0x6f0 : 0x660)),
  );
}
export function parseOwnerQuantity(value: string): number | null {
  const normalized = normalizeQuantityDigits(value);
  if (!/^\d+$/.test(normalized)) return null;
  const quantity = Number(normalized);
  return Number.isInteger(quantity) &&
    quantity >= 1 &&
    quantity <= OWNER_LINE_MAX
    ? quantity
    : null;
}
export function quantityKey(value: string, key: string): string {
  const digit = normalizeQuantityDigits(key);
  if (/^\d$/.test(digit)) return value.length < 3 ? value + digit : value;
  if (key === "Backspace") return value.slice(0, -1);
  if (key === "Delete") return "";
  return value;
}
