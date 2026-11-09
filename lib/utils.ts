/**
 * Shared utility functions used across the app.
 * Import from here instead of defining locally in components.
 */

/** Convert SCREAMING_SNAKE_CASE enum names (e.g. "FULL_TIME") to Title Case labels ("Full Time").
 *  Always lowercases first so SCREAMING input doesn't stay uppercase.
 */
export const toLabel = (s: string): string =>
  s
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

/** Join class names, skipping falsy values. */
export const cn = (...classes: (string | false | null | undefined)[]): string =>
  classes.filter(Boolean).join(" ");
