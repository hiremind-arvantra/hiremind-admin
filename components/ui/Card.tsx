import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
}

const PADDING = { none: "", sm: "p-4", md: "p-5", lg: "p-6" } as const;

export function Card({ padding = "md", className, ...rest }: CardProps) {
  return <div className={cn("card", PADDING[padding], className)} {...rest} />;
}

export function CardHeader({
  title,
  action,
  className,
}: {
  title: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-3 mb-4", className)}>
      <h2 className="font-display font-bold text-[0.9375rem] text-ink-900">{title}</h2>
      {action}
    </div>
  );
}
