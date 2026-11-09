"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";

/*
 * Tabs with a sliding active indicator.
 *   variant="line"      — page-level sections (underline slides between tabs)
 *   variant="segmented" — in-card filters (a white pill slides between tabs)
 *
 * Presentation only: the caller owns the value and decides what onChange does (some
 * tabs navigate instead of switching). Arrow keys / Home / End move the selection.
 */
export interface TabItem<K extends string = string> {
  key: K;
  label: React.ReactNode;
  count?: number;
}

interface TabBarProps<K extends string> {
  items: TabItem<K>[];
  value: K;
  onChange: (key: K) => void;
  ariaLabel: string;
  variant?: "line" | "segmented";
  /** Content on the right of a line tab bar (e.g. an existing sort control). */
  trailing?: React.ReactNode;
  className?: string;
}

export function TabBar<K extends string>({
  items,
  value,
  onChange,
  ariaLabel,
  variant = "line",
  trailing,
  className = "",
}: TabBarProps<K>) {
  const listRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  const measure = useCallback(() => {
    const active = listRef.current?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
    if (!active) {
      setIndicator(null);
      return;
    }
    const left = active.offsetLeft;
    const width = active.offsetWidth;
    setIndicator((prev) => (prev && prev.left === left && prev.width === width ? prev : { left, width }));
  }, []);

  useLayoutEffect(() => {
    measure();
  });

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(list);
    return () => observer.disconnect();
  }, [measure]);

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const index = items.findIndex((item) => item.key === value);
    let next = -1;
    if (e.key === "ArrowRight") next = (index + 1) % items.length;
    else if (e.key === "ArrowLeft") next = (index - 1 + items.length) % items.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = items.length - 1;
    if (next < 0) return;
    e.preventDefault();
    onChange(items[next].key);
    listRef.current?.querySelectorAll<HTMLElement>('[role="tab"]')[next]?.focus();
  }

  return (
    <div className={`${variant === "line" ? "tabbar-line" : "tabbar-seg"} ${className}`}>
      <div ref={listRef} role="tablist" aria-label={ariaLabel} className="tabbar-list" onKeyDown={onKeyDown}>
        {indicator && (
          <span
            aria-hidden="true"
            className="tabbar-indicator"
            style={{ transform: `translateX(${indicator.left}px)`, width: indicator.width }}
          />
        )}
        {items.map((item) => {
          const selected = item.key === value;
          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(item.key)}
              className="tabbar-tab"
            >
              {item.label}
              {item.count !== undefined && <span className="tabbar-count">{item.count}</span>}
            </button>
          );
        })}
      </div>
      {trailing && <div className="shrink-0">{trailing}</div>}
    </div>
  );
}
