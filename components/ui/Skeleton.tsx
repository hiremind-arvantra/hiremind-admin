/* Loading placeholders. The shimmer stops under reduced motion. */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`skeleton ${className}`} />;
}

/** A stack of card-shaped placeholders with an accessible status label. */
export function LoadingState({ label = "Loading…", rows = 3, className = "" }: { label?: string; rows?: number; className?: string }) {
  return (
    <div role="status" aria-live="polite" className={`space-y-4 ${className}`}>
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="card p-5 space-y-3">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}
