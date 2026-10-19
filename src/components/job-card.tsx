import { ChevronRight, MapPin } from "lucide-react";
import Link from "next/link";
import { cn, initials, SOURCE_LABEL, STATUS_LABEL, scoreTone, timeAgo, VERDICT_LABEL } from "@/lib/format";
import type { JobListItem } from "@/lib/types";
import { Badge } from "./ui/badge";
import { ScoreRing } from "./ui/score-ring";

export function CompanyAvatar({ name, className }: { name: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex size-11 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-sm font-semibold text-muted",
        className,
      )}
    >
      {initials(name || "?")}
    </div>
  );
}

export function JobCard({ job, compact }: { job: JobListItem; compact?: boolean }) {
  return (
    <Link
      href={`/vagas/${job.id}`}
      className="group flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 shadow-card transition hover:-translate-y-px hover:border-primary/40 hover:shadow-pop"
    >
      <CompanyAvatar name={job.company} className={compact ? "hidden sm:flex" : "hidden sm:flex"} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h3 className="truncate font-medium group-hover:text-primary">{job.title}</h3>
          {job.status !== "nova" && (
            <Badge tone={job.status === "candidatado" ? "success" : job.status === "salva" ? "primary" : "neutral"}>
              {STATUS_LABEL[job.status]}
            </Badge>
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          <span className="font-medium text-text/80">{job.company || "Empresa não informada"}</span>
          {job.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3" />
              {job.location}
            </span>
          )}
          {!compact && <span>{SOURCE_LABEL[job.source] ?? job.source}</span>}
          {!compact && job.created_at && <span>{timeAgo(job.created_at)}</span>}
        </div>
        {!compact && job.summary && <p className="mt-2 line-clamp-2 text-sm text-muted">{job.summary}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <div className="hidden text-right md:block">
          {job.verdict ? (
            <Badge tone={scoreTone(job.score)}>{VERDICT_LABEL[job.verdict]}</Badge>
          ) : (
            <Badge>Aguardando análise</Badge>
          )}
        </div>
        <ScoreRing score={job.score} />
        <ChevronRight className="hidden size-4 text-muted transition group-hover:translate-x-0.5 sm:block" />
      </div>
    </Link>
  );
}
