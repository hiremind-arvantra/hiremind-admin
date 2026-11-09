/**
 * Shared form validators.
 * Import from here instead of duplicating inline regex/logic across components.
 */

export const isValidEmail = (v: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export const isValidPhone = (v: string): boolean => /^\d{10}$/.test(v);

/** Returns an error message string, or null if the password meets all requirements */
export const isStrongPassword = (v: string): string | null => {
  if (v.length < 8) return "Minimum 8 characters";
  if (!/[A-Z]/.test(v)) return "Must contain an uppercase letter";
  if (!/[a-z]/.test(v)) return "Must contain a lowercase letter";
  if (!/[0-9]/.test(v)) return "Must contain a number";
  if (!/[^A-Za-z0-9]/.test(v)) return "Must contain a special character (e.g. @#$!)";
  return null;
};

/** Validates MM/YYYY date strings used in experience / education date fields */
export const isValidMMYYYY = (val: string): boolean => {
  if (!val || val === "Present") return true;
  if (!/^\d{2}\/\d{4}$/.test(val)) return false;
  const [mm, yyyy] = val.split("/").map(Number);
  return mm >= 1 && mm <= 12 && yyyy >= 1900 && yyyy <= 2100;
};

/** Returns true if the date range is valid (from ≤ to, or to is "Present") */
export const isDateRangeValid = (from: string, to: string): boolean => {
  if (!from || !to || to === "Present") return true;
  const [fmm, fyyyy] = from.split("/").map(Number);
  const [tmm, tyyyy] = to.split("/").map(Number);
  return fyyyy < tyyyy || (fyyyy === tyyyy && fmm <= tmm);
};
