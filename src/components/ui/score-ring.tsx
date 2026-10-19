import { cn, scoreTone } from "@/lib/format";

const STROKE: Record<string, string> = {
  success: "stroke-success",
  primary: "stroke-primary",
  warning: "stroke-warning",
  danger: "stroke-danger",
  neutral: "stroke-border",
};

const TEXT: Record<string, string> = {
  success: "text-success",
  primary: "text-primary",
  warning: "text-warning",
  danger: "text-danger",
  neutral: "text-muted",
};

/** Anel de compatibilidade 0–100. Sem nota, mostra um traço. */
export function ScoreRing({ score, size = 48, className }: { score: number | null; size?: number; className?: string }) {
  const tone = scoreTone(score);
  const stroke = size >= 80 ? 7 : 4.5;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = score ?? 0;

  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
      title={score === null ? "Ainda não analisada" : `${score}% de compatibilidade`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-surface-2" />
        {score !== null && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - pct / 100)}
            className={cn(STROKE[tone], "transition-[stroke-dashoffset] duration-700")}
          />
        )}
      </svg>
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center font-semibold tabular-nums",
          TEXT[tone],
          size >= 80 ? "text-2xl" : "text-sm",
        )}
      >
        {score === null ? "–" : score}
      </div>
    </div>
  );
}
