// utils/sanitize.ts
/**
 * Basic input sanitization utilities.
 * Trim whitespace and escape HTML special characters to prevent XSS.
 */
export function cleanInput(str: string): string {
  return str.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function cleanNumber(value: any, defaultValue = 0): number {
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
}

