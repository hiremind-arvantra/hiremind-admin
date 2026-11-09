export const API = {
  USERS: "/api/users",
  CANDIDATE: "/api/candidate",
  COMPANY: "/api/company",
} as const;

const isBrowser = typeof window !== "undefined";

/** Reads the stored access token (set after register/login) */
export const getAccessToken = (): string | null =>
  isBrowser ? localStorage.getItem("hiremind_access_token") : null;

export const setAccessToken = (token: string) => localStorage.setItem("hiremind_access_token", token);

/** Full name cached at registration/profile-fetch time */
export const getStoredUserName = (): string | null =>
  isBrowser ? localStorage.getItem("hiremind_user_name") : null;

export const setStoredUserName = (name: string) => localStorage.setItem("hiremind_user_name", name);

/** Job title cached at registration/profile-fetch time */
export const getStoredJobTitle = (): string | null =>
  isBrowser ? localStorage.getItem("hiremind_job_title") : null;

export const setStoredJobTitle = (title: string) => localStorage.setItem("hiremind_job_title", title);

/** Company name cached at company registration time */
export const getStoredCompanyName = (): string | null =>
  isBrowser ? localStorage.getItem("hiremind_company_name") : null;

export const setStoredCompanyName = (name: string): void => {
  if (isBrowser) localStorage.setItem("hiremind_company_name", name);
};

/** Refresh token cached at login/register time */
export const setRefreshToken = (token: string): void => {
  if (isBrowser) localStorage.setItem("hiremind_refresh_token", token);
};

/** Current user ID cached at login/register time */
export const setUserId = (id: string): void => {
  if (isBrowser) localStorage.setItem("hiremind_user_id", id);
};

/** Company logo presigned URL cached after login/profile-fetch */
export const getStoredCompanyLogoUrl = (): string | null =>
  isBrowser ? localStorage.getItem("hiremind_company_logo_url") : null;

export const setStoredCompanyLogoUrl = (url: string): void => {
  if (isBrowser) localStorage.setItem("hiremind_company_logo_url", url);
};

/** SSR-safe JSON read for stored preferences (e.g. matching weights). */
export const getStoredJson = <T,>(key: string): T | null => {
  if (!isBrowser) return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

/** SSR-safe JSON write for stored preferences. */
export const setStoredJson = (key: string, value: unknown): void => {
  if (!isBrowser) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota or private-mode failures must never break the caller */
  }
};

export const clearAuth = () => {
  if (!isBrowser) return;
  [
    "hiremind_access_token",
    "hiremind_refresh_token",
    "hiremind_user_id",
    "hiremind_user_name",
    "hiremind_job_title",
    "hiremind_company_name",
    "hiremind_company_logo_url",
  ].forEach((k) => localStorage.removeItem(k));
};
