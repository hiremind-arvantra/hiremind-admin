import AuthHeader from "./AuthHeader";

/*
 * Shared frame for the single-card auth screens (verify email, forgot / reset / set
 * password): the standard 72px auth header, the calm workspace canvas, and one elevated
 * card at a fixed offset below the header so every screen's heading lands in the same place.
 */
export default function AuthCardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col app-canvas">
      <AuthHeader border cta={{ label: "Back to Login", href: "/login", icon: null }} />
      <main id="main" tabIndex={-1} className="flex-1 px-4 sm:px-6 pt-10 pb-16 lg:pt-16">
        <div className="mx-auto w-full max-w-[440px] card-elevated p-6 sm:p-8 animate-fade-up">
          {children}
        </div>
      </main>
    </div>
  );
}

type GlyphKind = "mail" | "key" | "lock" | "check" | "send" | "link";

/** Soft lit icon tile that opens each auth card. */
export function AuthGlyph({ kind, tone = "brand" }: { kind: GlyphKind; tone?: "brand" | "success" }) {
  const toneClass =
    tone === "success"
      ? "bg-green-50 text-green-700 ring-green-100"
      : "bg-[image:var(--gradient-brand-soft)] text-brand-600 ring-brand-100";
  return (
    <span className={`grid place-items-center w-12 h-12 rounded-2xl ring-1 ${toneClass}`}>
      <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        {kind === "mail" && (<><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="M3.5 7l8.5 6 8.5-6" /></>)}
        {kind === "key" && (<><circle cx="8" cy="15" r="4" /><path d="M10.8 12.2L20 3M17 6l2.5 2.5M14.5 8.5L16.5 10.5" /></>)}
        {kind === "lock" && (<><rect x="5" y="11" width="14" height="10" rx="2.5" /><path d="M8 11V7.5a4 4 0 0 1 8 0V11M12 15v2" /></>)}
        {kind === "check" && (<path d="M20 6L9 17l-5-5" strokeWidth="2.2" />)}
        {kind === "send" && (<><path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" /></>)}
        {kind === "link" && (<><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" /><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" /></>)}
      </svg>
    </span>
  );
}
