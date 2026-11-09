export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * Prefix a public/ asset path with the deploy basePath.
 * In dev: returns the path unchanged.
 * In a production build with basePath="/aihrms": "/logo.png" → "/aihrms/logo.png".
 *
 * Use ONLY for raw <img src> / CSS url() — next/image and <Link> handle basePath automatically.
 */
export const assetPath = (p: string): string => {
  if (!p.startsWith("/")) return p;
  return `${BASE_PATH}${p}`;
};
