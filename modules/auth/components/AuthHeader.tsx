import Link from "next/link";
import BrandLogo from "@/components/marketing/BrandLogo";

interface AuthHeaderCta {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface AuthHeaderProps {
  cta: AuthHeaderCta;
  /** Show bottom border — default false */
  border?: boolean;
  /** Make header sticky (registration pages) */
  sticky?: boolean;
  /** Optional text shown before the CTA button */
  preCtaText?: string;
  /**
   * Content column. Defaults to the shared public-page column (.site-container), the
   * same one the marketing header and every auth/legal page body use.
   */
  contentClassName?: string;
}

export default function AuthHeader({
  cta,
  border = false,
  sticky = false,
  preCtaText,
  contentClassName = "site-container",
}: AuthHeaderProps) {
  return (
    <header className={`chrome-header shrink-0 ${border ? "" : "border-b-transparent"} ${sticky ? "sticky top-0 z-30" : "relative z-10"}`}>
      <div className={`${contentClassName} h-full flex items-center justify-between gap-3`}>
        <Link href="/" className="rounded-lg" aria-label="HireMind home">
          <BrandLogo size="md" />
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          {preCtaText && (
            <span className="text-body-sm text-ink-500 hidden sm:inline">{preCtaText}</span>
          )}
          {!preCtaText && (
            <Link href="/help" aria-label="Need help?" className="btn btn-ghost btn-sm">
              <InfoIcon /> <span className="hidden sm:inline">Need help?</span>
            </Link>
          )}
          <Link href={cta.href} className="btn btn-outline btn-sm">
            {cta.icon} {cta.label}
          </Link>
        </div>
      </div>
    </header>
  );
}

function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
