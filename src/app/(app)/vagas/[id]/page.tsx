"use client";

import {
  AlertTriangle,
  ArrowLeft,
  Bookmark,
  CheckCircle2,
  ChevronDown,
  CircleDashed,
  ExternalLink,
  Lightbulb,
  MapPin,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
  Undo2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { CompanyAvatar } from "@/components/job-card";
import { useToast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, Skeleton } from "@/components/ui/controls";
import { ScoreRing } from "@/components/ui/score-ring";
import { api, useApi } from "@/lib/api";
import { cn, formatDateTime, SOURCE_LABEL, scoreTone, STATUS_LABEL, timeAgo, VERDICT_LABEL } from "@/lib/format";
import type { Job, JobStatus } from "@/lib/types";

function InsightList({
  title,
  items,
  icon,
  tone,
}: {
  title: string;
  items: string[];
  icon: React.ReactNode;
  tone: "success" | "warning" | "danger";
}) {
  if (items.length === 0) return null;
  const color = { success: "text-success", warning: "text-warning", danger: "text-danger" }[tone];
  const bg = { success: "bg-success-soft", warning: "bg-warning-soft", danger: "bg-danger-soft" }[tone];
  return (
    <Card className="p-5">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <span className={cn("flex size-7 items-center justify-center rounded-lg [&_svg]:size-4", bg, color)}>{icon}</span>
        {title}
        <span className="text-muted">{items.length}</span>
      </h3>
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5 text-sm leading-relaxed">
            <span className={cn("mt-2 size-1.5 shrink-0 rounded-full", color.replace("text-", "bg-"))} />
            {item}
          </li>
        ))}
      </ul>
    </Card>
  );
}

const STATUS_ACTIONS: { status: JobStatus; label: string; icon: React.ReactNode }[] = [
  { status: "salva", label: "Salvar", icon: <Bookmark className="size-4" /> },
  { status: "candidatado", label: "Me candidatei", icon: <Send className="size-4" /> },
  { status: "descartada", label: "Descartar", icon: <XCircle className="size-4" /> },
];

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const { data, loading, error, setData } = useApi<{ job: Job }>(`/jobs/${id}`);
  const [busy, setBusy] = useState<string | null>(null);
  const [showDescription, setShowDescription] = useState(false);

  if (loading && !data) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-44" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    );
  }
  if (error || !data) {
    return <EmptyState icon={<CircleDashed />} title="Vaga não encontrada" description={error ?? undefined} action={<ButtonLink href="/vagas">Voltar para vagas</ButtonLink>} />;
  }

  const { job } = data;
  const a = job.analysis;

  const setStatus = async (status: JobStatus) => {
    setBusy(status);
    try {
      const r = await api<{ job: Job }>(`/jobs/${job.id}`, { method: "PATCH", body: { status } });
      setData(r);
      toast.success(status === "nova" ? "Vaga voltou para novas" : `Marcada como “${STATUS_LABEL[status]}”`);
    } catch (err) {
      toast.error("Não foi possível atualizar", (err as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const reanalyze = async () => {
    setBusy("analyze");
    try {
      const r = await api<{ job: Job }>(`/jobs/${job.id}/analyze`, { method: "POST" });
      setData(r);
      toast.success("Análise atualizada", r.job.analysis ? `Nota: ${r.job.analysis.score}` : undefined);
    } catch (err) {
      toast.error("Não foi possível analisar", (err as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    if (!confirm("Excluir esta vaga? Essa ação não pode ser desfeita.")) return;
    await api(`/jobs/${job.id}`, { method: "DELETE" });
    toast.success("Vaga excluída");
    router.push("/vagas");
  };

  return (
    <div className="animate-fade-up flex flex-col gap-6">
      <Link href="/vagas" className="inline-flex w-fit items-center gap-1.5 text-sm text-muted hover:text-text">
        <ArrowLeft className="size-4" /> Voltar para vagas
      </Link>

      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          <div className="flex min-w-0 flex-1 gap-4">
            <CompanyAvatar name={job.company} className="size-14 text-base" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{job.title}</h1>
                {job.status !== "nova" && (
                  <Badge tone={job.status === "candidatado" ? "success" : job.status === "salva" ? "primary" : "neutral"}>
                    {STATUS_LABEL[job.status]}
                  </Badge>
                )}
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
                <span className="font-medium text-text">{job.company || "Empresa não informada"}</span>
                {job.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5" />
                    {job.location}
                  </span>
                )}
                <span>
                  {SOURCE_LABEL[job.source] ?? job.source} · {timeAgo(job.created_at)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl bg-surface-2 p-4 md:w-64">
            <ScoreRing score={a?.score ?? null} size={84} />
            <div>
              <p className="text-xs text-muted">Compatibilidade</p>
              {a ? (
                <p className="font-semibold">{VERDICT_LABEL[a.verdict]}</p>
              ) : (
                <p className="font-semibold">Ainda não analisada</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-5">
          {job.url && (
            <ButtonLink href={job.url} external icon={<ExternalLink className="size-4" />}>
              Ver vaga original
            </ButtonLink>
          )}
          {STATUS_ACTIONS.filter((s) => s.status !== job.status).map((s) => (
            <Button key={s.status} variant="secondary" onClick={() => setStatus(s.status)} loading={busy === s.status} icon={s.icon}>
              {s.label}
            </Button>
          ))}
          {job.status !== "nova" && (
            <Button variant="ghost" onClick={() => setStatus("nova")} loading={busy === "nova"} icon={<Undo2 className="size-4" />}>
              Desfazer
            </Button>
          )}
          <div className="ml-auto flex gap-2">
            <Button variant="ghost" onClick={reanalyze} loading={busy === "analyze"} icon={<RefreshCw className="size-4" />}>
              {a ? "Analisar de novo" : "Analisar agora"}
            </Button>
            <Button variant="ghost" onClick={remove} aria-label="Excluir vaga" title="Excluir vaga">
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      </Card>

      {a ? (
        <>
          <Card className="flex gap-4 p-5">
            <div
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-xl",
                {
                  success: "bg-success-soft text-success",
                  primary: "bg-primary-soft text-primary",
                  warning: "bg-warning-soft text-warning",
                  danger: "bg-danger-soft text-danger",
                  neutral: "bg-surface-2 text-muted",
                }[scoreTone(a.score)],
              )}
            >
              <Sparkles className="size-4.5" />
            </div>
            <div>
              <h2 className="font-semibold">Resumo da análise</h2>
              <p className="mt-1 leading-relaxed text-muted">{a.summary}</p>
              <p className="mt-3 text-xs text-muted">
                {a.engine === "palavras-chave" ? "Análise por palavras-chave" : `Analisado por IA (${a.engine})`} ·{" "}
                {formatDateTime(a.analyzed_at)} ·{" "}
                <Link href="/como-funciona" className="text-primary hover:underline">
                  Como essa nota é calculada?
                </Link>
              </p>
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <InsightList title="O que combina" items={a.strengths} icon={<CheckCircle2 />} tone="success" />
            <InsightList title="O que falta" items={a.gaps} icon={<CircleDashed />} tone="warning" />
            <InsightList title="Pontos de atenção" items={a.red_flags} icon={<AlertTriangle />} tone="danger" />
          </div>

          {a.application_tips && (
            <Card className="border-primary/30 bg-primary-soft/50 p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-primary">
                <Lightbulb className="size-4" /> Como se destacar nesta candidatura
              </h3>
              <p className="mt-2 text-sm leading-relaxed">{a.application_tips}</p>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <EmptyState
            icon={<Sparkles />}
            title="Esta vaga ainda não foi analisada"
            description="Analise para ver a nota, o que combina com você e o que falta."
            action={
              <Button onClick={reanalyze} loading={busy === "analyze"} icon={<Sparkles className="size-4" />}>
                Analisar agora
              </Button>
            }
          />
        </Card>
      )}

      <Card>
        <button
          onClick={() => setShowDescription(!showDescription)}
          className="flex w-full items-center justify-between p-5 text-left font-semibold"
        >
          Descrição da vaga
          <ChevronDown className={cn("size-5 text-muted transition", showDescription && "rotate-180")} />
        </button>
        {showDescription && (
          <div className="border-t border-border p-5 text-sm leading-relaxed whitespace-pre-wrap text-muted">
            {job.description}
          </div>
        )}
      </Card>
    </div>
  );
}
