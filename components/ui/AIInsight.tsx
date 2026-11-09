/*
 * Surface for existing AI output (match insights, AI summaries, recommendations,
 * ghost / duplicate / fake-profile signals). A faint static neural mesh sits in the
 * corner; the chip names what the AI produced. Never use it for non-AI content.
 */
export interface AIInsightProps {
  title?: React.ReactNode;
  /** Chip text naming the AI output, e.g. "AI summary", "AI match". */
  label?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function AIInsight({ title, label = "AI insight", action, children, className = "" }: AIInsightProps) {
  return (
    <section className={`ai-insight ${className}`}>
      <NeuralMesh />
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="ai-chip">
              <SparkIcon />
              {label}
            </span>
            {title && <h3 className="mt-2.5 section-title">{title}</h3>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
        {children && <div className="mt-3">{children}</div>}
      </div>
    </section>
  );
}

function SparkIcon() {
  return (
    <svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9z" />
    </svg>
  );
}

/** Static constellation — nodes and links, drawn in currentColor at low opacity. */
export function NeuralMesh({ className = "ai-insight-mesh" }: { className?: string }) {
  const nodes: [number, number][] = [
    [30, 40], [80, 22], [130, 48], [180, 26], [205, 78],
    [150, 96], [96, 84], [48, 110], [120, 132], [184, 128],
  ];
  const links: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 4], [2, 6], [6, 0], [6, 5],
    [5, 4], [6, 7], [7, 8], [8, 5], [5, 9], [9, 4], [1, 6],
  ];
  return (
    <svg aria-hidden="true" viewBox="0 0 220 150" className={className} fill="none">
      {links.map(([from, to]) => (
        <line
          key={`${from}-${to}`}
          x1={nodes[from][0]} y1={nodes[from][1]} x2={nodes[to][0]} y2={nodes[to][1]}
          stroke="currentColor" strokeWidth="1" strokeOpacity="0.55"
        />
      ))}
      {nodes.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 3.5 : 2.5} fill="currentColor" />
      ))}
    </svg>
  );
}
