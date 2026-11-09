import type { Metadata } from "next";

// Sign-in and registration screens must never appear in search results.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
