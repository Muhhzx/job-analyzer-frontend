"use client";

import {
  AlertTriangle,
  ArrowLeft,
  Bookmark,
  CheckCircle2,
  ChevronDown,
  CircleDashed,
  ExternalLink,
  KanbanSquare,
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
import { ApplicationForm } from "@/components/application-form";
import { CompanyAvatar } from "@/components/job-card";
import { PreviewPanel } from "@/components/preview-panel";
import { SalaryCard } from "@/components/salary-card";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
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
  const [confirmOpen, setConfirmOpen] = useState(false);

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

  // Só roda depois que o usuário confirma no modal.
  const analyzeWithAi = async () => {
    setConfirmOpen(false);
    setBusy("analyze");
    try {
      const r = await api<{ job: Job }>(`/jobs/${job.id}/analyze`, { method: "POST" });
      setData(r);
      toast.success("Análise com IA concluída", r.job.analysis ? `Nota da IA: ${r.job.analysis.score}` : undefined);
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
            <ScoreRing score={a?.score ?? job.preview?.score ?? null} size={84} preview={!a} />
            <div>
              <p className="text-xs text-muted">{a ? "Nota da IA" : "Prévia grátis"}</p>
              {a ? (
                <p className="font-semibold">{VERDICT_LABEL[a.verdict]}</p>
              ) : (
                <p className="font-semibold">{job.preview?.belowCutoff ? "Pouco compatível" : "Sem análise de IA"}</p>
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
            <Button variant="ghost" onClick={remove} aria-label="Excluir vaga" title="Excluir vaga">
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      </Card>

      {job.application && job.status !== "descartada" && (
        <Card>
          <CardHeader
            icon={<KanbanSquare />}
            title="Minha candidatura"
            description="Etapa, CV usado, pretensão, contato e anotações deste processo."
            action={
              <ButtonLink href="/candidaturas" variant="ghost" size="sm">
                Ver quadro
              </ButtonLink>
            }
          />
          <div className="p-5">
            <ApplicationForm
              key={`${job.application.stage}-${job.application.updated_at}`}
              jobId={job.id}
              application={job.application}
              events={job.applicationEvents}
              onSaved={({ application, events }) =>
                setData({
                  job: {
                    ...job,
                    application,
                    applicationEvents: events,
                    status: application.stage === "salva" ? "salva" : "candidatado",
                  },
                })
              }
            />
          </div>
        </Card>
      )}

      {job.preview && <PreviewPanel preview={job.preview} cutoff={job.prefilterMinScore} />}

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
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold">Análise da IA</h2>
              <p className="mt-1 leading-relaxed text-muted">{a.summary}</p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-muted">
                  {a.engine} · {formatDateTime(a.analyzed_at)} ·{" "}
                  <Link href="/como-funciona" className="text-primary hover:underline">
                    Como essa nota é calculada?
                  </Link>
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setConfirmOpen(true)}
                  loading={busy === "analyze"}
                  icon={<RefreshCw className="size-3.5" />}
                >
                  Analisar de novo
                </Button>
              </div>
            </div>
          </Card>

          {a.salary_estimate && <SalaryCard salary={a.salary_estimate} />}

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
        <Card className="flex flex-col items-start gap-4 border-primary/30 p-5 sm:flex-row sm:items-center sm:p-6">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <Sparkles className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold">Quer uma análise completa com IA?</h2>
            <p className="mt-0.5 text-sm text-muted">
              A IA lê a vaga inteira e o seu perfil e diz o que combina, o que falta, os pontos de atenção e como se
              destacar.
              {!job.aiEnabled && " A IA está desligada: falta a chave no .env do backend."}
            </p>
          </div>
          <Button
            onClick={() => setConfirmOpen(true)}
            loading={busy === "analyze"}
            disabled={!job.aiEnabled}
            icon={<Sparkles className="size-4" />}
          >
            Analisar com IA
          </Button>
        </Card>
      )}

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={job.preview?.belowCutoff && !a ? "Analisar uma vaga pouco compatível?" : "Analisar esta vaga com IA?"}
        description={
          job.preview?.belowCutoff && !a
            ? `A prévia grátis deu ${job.preview.score}, abaixo do corte de ${job.prefilterMinScore}. A IA pode confirmar que não vale a pena, e a análise conta na sua cota do mês.`
            : "A análise usa a sua cota de IA do mês (cerca de US$ 0,001 por vaga)."
        }
      >
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={analyzeWithAi} icon={<Sparkles className="size-4" />}>
            {job.preview?.belowCutoff && !a ? "Sim, analisar mesmo assim" : "Sim, analisar"}
          </Button>
        </div>
      </Modal>

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
