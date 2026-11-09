"use client";

import { Skeleton } from "@/components/ui/Skeleton";

/*
 * Multi-series line chart, hand-rolled in SVG.
 *
 * The project carries no chart library and the recruiter's Hiring Overview already draws
 * its own SVG, so this follows that precedent rather than adding a dependency for four
 * screens. Series share one y-scale so they are visually comparable, which is the whole
 * point of the Platform Overview card.
 *
 * The visual is aria-hidden and paired with an sr-only data table — a screen reader gets
 * the numbers, not a description of a picture.
 */

export interface TrendSeries<T> {
  key: keyof T & string;
  label: string;
  /** Any CSS colour; design-system tokens are passed as var(--color-…). */
  color: string;
}

const W = 600;
const H = 180;

export function TrendChart<T extends { bucket: string }>({
  points,
  series,
  loading = false,
  caption = "Trend over the selected period",
}: {
  points: T[];
  series: TrendSeries<T>[];
  loading?: boolean;
  caption?: string;
}) {
  if (loading) {
    return (
      <div role="status" aria-live="polite" className="w-full">
        <span className="sr-only">Loading chart…</span>
        <Skeleton className="h-44 w-full rounded-2xl" />
      </div>
    );
  }

  if (points.length === 0) {
    return <p className="empty-state text-body-sm">No data for this period.</p>;
  }

  const values = points.flatMap((point) => series.map((s) => Number(point[s.key]) || 0));
  // A flat-zero series would divide by zero; 1 keeps the baseline at the bottom.
  const max = Math.max(1, ...values);
  const step = points.length > 1 ? W / (points.length - 1) : 0;

  const pathFor = (s: TrendSeries<T>) =>
    points
      .map((point, i) => {
        const x = points.length > 1 ? i * step : W / 2;
        const y = H - ((Number(point[s.key]) || 0) / max) * H;
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");

  // Up to five evenly spaced labels, so a 90-day range does not crowd the axis.
  const labelStride = Math.max(1, Math.ceil(points.length / 5));

  return (
    <div className="w-full">
      <div className="relative">
        <div aria-hidden="true" className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className="block h-px bg-ink-100" />
          ))}
        </div>
        <svg
          aria-hidden="true"
          viewBox={`0 0 ${W} ${H}`}
          className="relative w-full h-44 overflow-visible"
          preserveAspectRatio="none"
        >
          {series.map((s) => (
            <path
              key={s.key}
              d={pathFor(s)}
              fill="none"
              stroke={s.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
      </div>

      <div
        aria-hidden="true"
        className="mt-2 flex justify-between text-micro text-ink-500"
      >
        {points
          .filter((_, i) => i % labelStride === 0 || i === points.length - 1)
          .map((point) => (
            <span key={point.bucket} className="truncate">{point.bucket}</span>
          ))}
      </div>

      <table className="sr-only">
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Period</th>
            {series.map((s) => (
              <th key={s.key} scope="col">{s.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {points.map((point) => (
            <tr key={point.bucket}>
              <th scope="row">{point.bucket}</th>
              {series.map((s) => (
                <td key={s.key}>{String(point[s.key] ?? 0)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
