"use client";

import { useEffect, useRef, useState } from "react";

/*
 * AI match score orb: a conic progress ring around a lit sphere core. The ring sweeps
 * in once when the orb first scrolls into view (the number itself is static, so nothing
 * flickers and the value is right in server-rendered markup). The large size adds a
 * tilted orbit that turns on hover. Reduced motion removes the sweep globally.
 *
 * Tone tiers keep the existing meaning of match colours: ≥80 green, ≥60 violet,
 * ≥40 amber, below that neutral.
 */
export type MatchScoreSize = "sm" | "md" | "lg";

export interface MatchScoreProps {
  /** 0–100. null / undefined renders an empty ring with an em dash. */
  value: number | null | undefined;
  size?: MatchScoreSize;
  /** Accessible name prefix, e.g. "AI match". */
  label?: string;
  /** Text under the orb, e.g. "Excellent Match". */
  caption?: React.ReactNode;
  className?: string;
}

export function matchTone(value: number): "high" | "good" | "fair" | "low" {
  if (value >= 80) return "high";
  if (value >= 60) return "good";
  if (value >= 40) return "fair";
  return "low";
}

export function MatchScore({ value, size = "md", label = "Match score", caption, className = "" }: MatchScoreProps) {
  const target = value == null || Number.isNaN(value) ? null : Math.max(0, Math.min(100, Math.round(value)));
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const progress = visible && target !== null ? target : 0;
  const tone = target === null ? "none" : matchTone(target);

  return (
    <div className={`orb-wrap ${className}`}>
      <div
        ref={ref}
        role="img"
        aria-label={target === null ? `${label}: not available` : `${label}: ${target}%`}
        className={`orb orb-${size} orb-tone-${tone}`}
        style={{ "--p": progress } as React.CSSProperties}
      >
        {size === "lg" && <span aria-hidden="true" className="orb-orbit" />}
        <span aria-hidden="true" className="orb-ring" />
        <span aria-hidden="true" className="orb-core" />
        <span aria-hidden="true" className="orb-value">
          {target === null ? "—" : (
            <>
              {target}
              <small>%</small>
            </>
          )}
        </span>
      </div>
      {caption && <div className="orb-caption">{caption}</div>}
    </div>
  );
}
