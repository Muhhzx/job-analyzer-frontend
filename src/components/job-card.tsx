import { ArrowUpRight, Clock, Globe, MapPin, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn, initials, SOURCE_LABEL, STATUS_LABEL, scoreTone, timeAgo, VERDICT_LABEL } from "@/lib/format";
import type { JobListItem } from "@/lib/types";
import { Badge } from "./ui/badge";
import { ScoreRing } from "./ui/score-ring";

// Cores do avatar da empresa: a mesma empresa sempre cai na mesma cor.
const AVATAR_TONES = [
  "from-amber-400/25 to-amber-400/5 text-amber-200 ring-amber-300/20",
  "from-sky-400/20 to-sky-400/5 text-sky-200 ring-sky-300/20",
  "from-emerald-400/20 to-emerald-400/5 text-emerald-200 ring-emerald-300/20",
  "from-violet-400/20 to-violet-400/5 text-violet-200 ring-violet-300/20",
  "from-rose-400/20 to-rose-400/5 text-rose-200 ring-rose-300/20",
  "from-zinc-300/15 to-zinc-300/5 text-zinc-200 ring-zinc-300/15",
];

function toneFor(name: string) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_TONES[hash % AVATAR_TONES.length];
}

export function CompanyAvatar({ name, className }: { name: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-b text-sm font-bold ring-1 ring-inset",
        toneFor(name || "?"),
        className,
      )}
    >
      {initials(name || "?")}
    </div>
  );
}

function Meta({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted [&_svg]:size-3.5 [&_svg]:text-muted/70">
      {icon}
      {children}
    </span>
  );
}

export function JobCard({
  job,
  compact,
  prefilterMinScore = 30,
}: {
  job: JobListItem;
  compact?: boolean;
  /** Nota de corte do pré-filtro: abaixo dela, a vaga é marcada como pouco compatível. */
  prefilterMinScore?: number;
}) {
  const belowCutoff = job.score === null && job.preview_score !== null && job.preview_score < prefilterMinScore;
  const analyzed = job.score !== null;

  return (
    <Link
      href={`/vagas/${job.id}`}
      className="surface-card group relative flex items-center gap-4 overflow-hidden rounded-2xl p-4 transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-pop sm:p-5"
    >
      {/* Faixa dourada que aparece ao passar o mouse */}
      <span className="bg-gold absolute inset-y-0 left-0 w-[3px] opacity-0 transition-opacity group-hover:opacity-100" />

      <CompanyAvatar name={job.company} className="hidden sm:flex" />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-[15px] font-semibold transition-colors group-hover:text-primary">{job.title}</h3>
          {job.status !== "nova" && (
            <Badge tone={job.status === "candidatado" ? "success" : job.status === "salva" ? "primary" : "neutral"}>
              {STATUS_LABEL[job.status]}
            </Badge>
          )}
        </div>
        <p className="mt-0.5 truncate text-sm text-text/75">{job.company || "Empresa não informada"}</p>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {job.location && <Meta icon={<MapPin />}>{job.location}</Meta>}
          {!compact && <Meta icon={<Globe />}>{SOURCE_LABEL[job.source] ?? job.source}</Meta>}
          {!compact && job.created_at && <Meta icon={<Clock />}>{timeAgo(job.created_at)}</Meta>}
        </div>

        {!compact && job.summary && <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-muted">{job.summary}</p>}
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <div className="hidden flex-col items-end gap-1.5 md:flex">
          {analyzed && job.verdict ? (
            <Badge tone={scoreTone(job.score)} icon={<Sparkles />}>
              {VERDICT_LABEL[job.verdict]}
            </Badge>
          ) : (
            <>
              <Badge>Prévia grátis</Badge>
              {belowCutoff && <Badge tone="warning">Pouco compatível</Badge>}
            </>
          )}
        </div>
        {/* Nota da IA se existir; senão, a prévia grátis (anel mais apagado). */}
        <ScoreRing score={job.score ?? job.preview_score} preview={!analyzed} size={52} />
        <span className="hidden size-8 items-center justify-center rounded-full bg-white/[0.04] text-muted ring-1 ring-inset ring-white/10 transition group-hover:bg-primary/15 group-hover:text-primary group-hover:ring-primary/30 sm:flex">
          <ArrowUpRight className="size-4" />
        </span>
      </div>
    </Link>
  );
}
