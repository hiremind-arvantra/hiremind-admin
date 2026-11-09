"use client";

import { useEffect, useRef } from "react";

/*
 * Subtle pointer-driven perspective for cards and image stages (max ±4° by default).
 *
 * Only active for a fine, hovering pointer with reduced motion off — touch devices and
 * reduced-motion users get a plain element. Updates are rAF-throttled, and the transform
 * exists only while the pointer is inside, so at rest nothing is composited. Do not wrap
 * components that open menus or dialogs: a transformed ancestor would contain fixed
 * descendants while hovered.
 */
interface TiltProps extends React.HTMLAttributes<HTMLDivElement> {
  max?: number;
  children: React.ReactNode;
}

export function Tilt({ max = 4, className = "", children, ...rest }: TiltProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const onMove = (e: PointerEvent) => {
      if (!finePointer.matches || reducedMotion.matches) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        el.dataset.tilt = "on";
        el.style.setProperty("--tilt-x", `${(-y * max).toFixed(2)}deg`);
        el.style.setProperty("--tilt-y", `${(x * max).toFixed(2)}deg`);
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(frame);
      delete el.dataset.tilt;
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [max]);

  return (
    <div ref={ref} className={`tilt ${className}`} {...rest}>
      {children}
    </div>
  );
}
