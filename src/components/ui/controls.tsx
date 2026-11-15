"use client";

import { cn } from "@/lib/format";

export function Switch({
  checked,
  onChange,
  id,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  id?: string;
  label: string;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
        checked ? "bg-gold shadow-glow" : "bg-white/10 ring-1 ring-inset ring-white/10",
      )}
    >
      <span
        className={cn(
          "inline-block size-5 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-5.5" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

/** Grupo de opções lado a lado (substitui select para poucas opções). */
export function Segmented<T extends string | number>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; hint?: string }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-xl border px-3 py-2.5 text-left transition",
            o.value === value
              ? "border-primary/60 bg-gradient-to-b from-primary/20 to-primary/5 shadow-glow"
              : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]",
          )}
        >
          <div className={cn("text-sm font-medium", o.value === value && "text-primary")}>{o.label}</div>
          {o.hint && <div className="text-xs text-muted">{o.hint}</div>}
        </button>
      ))}
    </div>
  );
}

export function ProgressBar({ value, max, danger }: { value: number; max: number; danger?: boolean }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
      <div
        className={cn("h-full rounded-full transition-all duration-700", danger || pct >= 90 ? "bg-danger" : "bg-gold")}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-2xl bg-white/[0.04]", className)} />;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-b from-primary/25 to-primary/5 text-primary ring-1 ring-inset ring-primary/25 [&_svg]:size-6">
        {icon}
      </div>
      <h3 className="font-semibold">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
