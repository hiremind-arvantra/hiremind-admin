/* Heading row for a section or card: optional icon tile, title, subtitle, right action. */
export interface SectionHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  as?: "h2" | "h3";
  className?: string;
}

export function SectionHeader({ title, subtitle, icon, action, as: Heading = "h2", className = "" }: SectionHeaderProps) {
  return (
    <div className={`section-header ${className}`}>
      <div className="flex items-start gap-3 min-w-0">
        {icon && <span className="icon-tile icon-tile-sm bg-brand-50 text-brand-600">{icon}</span>}
        <div className="min-w-0">
          <Heading className="section-title">{title}</Heading>
          {subtitle && <p className="section-subtitle">{subtitle}</p>}
        </div>
      </div>
      {/* The action is centred on the title's own line box (hence the title's text size
          here, so 1.35em matches its line height). Controls are taller than the title —
          a 40px button next to a 22px heading — and used to be nudged into place with a
          negative margin picked per caller, so no two headings lined up the same way. */}
      {action && <div className="shrink-0 flex items-center h-[1.35em] text-title-sm">{action}</div>}
    </div>
  );
}
