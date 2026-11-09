"use client";

import Link from "next/link";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 app-canvas">
      <div className="w-14 h-14 rounded-2xl bg-danger/10 ring-8 ring-danger/5 flex items-center justify-center text-danger">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <div className="text-center">
        <h2 className="font-display font-bold text-title-sm text-ink-900 mb-1">Something went wrong</h2>
        <p className="text-body text-ink-500 max-w-[320px]">
          {error.message || "An unexpected error occurred. Your progress has been preserved where possible."}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="btn btn-primary"
        >
          Try again
        </button>
        <Link
          href="/login"
          className="btn btn-outline"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}
