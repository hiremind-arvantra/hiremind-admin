"use client";

import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  label: ReactNode;
  error?: string;
  hint?: ReactNode;
  required?: boolean;
  id?: string;
}

/** Label + input + hint + error, wired for WCAG (htmlFor, aria-invalid, aria-describedby, role="alert"). */
export function Field({ label, error, hint, required, id, className, ...inputProps }: FieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={className}>
      <label htmlFor={inputId} className="block text-[0.8125rem] font-semibold text-ink-700 mb-1.5">
        {label}{" "}
        {required && (
          <span className="text-red-600" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <input
        id={inputId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          "w-full px-4 py-2.5 rounded-xl border text-[0.84375rem] bg-white text-ink-900 transition",
          error ? "border-red-400" : "border-ink-200 focus:border-brand-500",
        )}
        {...inputProps}
      />
      {hint && !error && (
        <p id={hintId} className="mt-1 text-[0.6875rem] text-ink-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-[0.75rem] text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
