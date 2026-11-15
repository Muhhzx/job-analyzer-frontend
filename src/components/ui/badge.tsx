import { cn, type Tone } from "@/lib/format";

const TONES: Record<Tone, string> = {
  success: "bg-success-soft text-success ring-success/25",
  primary: "bg-primary-soft text-primary ring-primary/25",
  warning: "bg-warning-soft text-warning ring-warning/25",
  danger: "bg-danger-soft text-danger ring-danger/25",
  neutral: "bg-white/[0.04] text-muted ring-white/10",
};

export function Badge({
  tone = "neutral",
  icon,
  children,
  className,
}: {
  tone?: Tone;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap ring-1 ring-inset [&_svg]:size-3",
        TONES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
