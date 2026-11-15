"use client";

import { CalendarDays, ExternalLink, FileText, GripVertical, KanbanSquare, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ApplicationForm, type SavedApplication } from "@/components/application-form";
import { CompanyAvatar } from "@/components/job-card";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, Skeleton } from "@/components/ui/controls";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { api, useApi } from "@/lib/api";
import { cn, formatDay, scoreTone, STAGE_INFO, timeAgo } from "@/lib/format";
import type { BoardItem, BoardResponse, Stage } from "@/lib/types";

const STAGES = Object.keys(STAGE_INFO) as Stage[];

/** Cor da bolinha no topo de cada coluna. */
const DOT: Record<string, string> = {
  neutral: "bg-muted",
  primary: "bg-primary",
  warning: "bg-warning",
  success: "bg-success",
  danger: "bg-danger",
};

function BoardCard({
  item,
  onOpen,
  onDragStart,
  dragging,
}: {
  item: BoardItem;
  onOpen: () => void;
  onDragStart: (e: React.DragEvent) => void;
  dragging: boolean;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen())}
      role="button"
      tabIndex={0}
      aria-label={`${item.title}, ${item.company}. Abrir candidatura`}
      className={cn(
        "surface-card group cursor-grab rounded-xl p-3 text-left transition hover:border-primary/30 active:cursor-grabbing",
        dragging && "opacity-40",
      )}
    >
      <div className="flex items-start gap-2.5">
        <CompanyAvatar name={item.company} className="size-8 rounded-lg text-[11px]" />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm leading-snug font-medium">{item.title}</p>
          <p className="truncate text-xs text-muted">{item.company || "Empresa não informada"}</p>
        </div>
        <GripVertical className="size-4 shrink-0 text-muted/40 group-hover:text-muted" />
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        {item.score !== null && <Badge tone={scoreTone(item.score)}>{item.score}</Badge>}
        {item.resume_used && (
          <Badge icon={<FileText />} className="max-w-[150px]">
            <span className="truncate">{item.resume_used}</span>
          </Badge>
        )}
        {item.applied_at && <Badge icon={<CalendarDays />}>{formatDay(item.applied_at)}</Badge>}
      </div>
      <p className="mt-2 text-[11px] text-muted">Nesta etapa {timeAgo(item.stage_changed_at)}</p>
    </div>
  );
}

export default function ApplicationsPage() {
  const toast = useToast();
  const { data, loading, error, setData, reload } = useApi<BoardResponse>("/applications");
  const [dragId, setDragId] = useState<number | null>(null);
  const [overStage, setOverStage] = useState<Stage | null>(null);
  const [openId, setOpenId] = useState<number | null>(null);

  if (loading && !data) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-16 w-72" />
        <div className="flex gap-4 overflow-hidden">
          {STAGES.map((s) => (
            <Skeleton key={s} className="h-72 w-64 shrink-0" />
          ))}
        </div>
      </div>
    );
  }
  if (error || !data) {
    return <EmptyState icon={<KanbanSquare />} title="Não foi possível carregar" description={error ?? undefined} />;
  }

  const items = data.items;
  const opened = items.find((i) => i.job_id === openId) ?? null;
  const update = (jobId: number, patch: Partial<BoardItem>) =>
    setData({ ...data, items: items.map((i) => (i.job_id === jobId ? { ...i, ...patch } : i)) });

  // Mover de coluna: atualiza a tela na hora e desfaz se o servidor recusar.
  const move = async (jobId: number, stage: Stage) => {
    const item = items.find((i) => i.job_id === jobId);
    if (!item || item.stage === stage) return;
    const before = data;
    update(jobId, { stage, stage_changed_at: new Date().toISOString() });
    try {
      const saved = await api<SavedApplication>(`/applications/${jobId}`, { method: "PATCH", body: { stage } });
      setData({
        ...before,
        items: before.items.map((i) => (i.job_id === jobId ? { ...i, ...saved.application } : i)),
      });
    } catch (err) {
      setData(before);
      toast.error("Não foi possível mover", (err as Error).message);
    }
  };

  const remove = async (jobId: number) => {
    if (!confirm("Tirar esta vaga do quadro? As anotações e o histórico desta candidatura serão apagados.")) return;
    try {
      await api(`/applications/${jobId}`, { method: "DELETE" });
      setOpenId(null);
      setData({ ...data, items: items.filter((i) => i.job_id !== jobId) });
      toast.success("Vaga tirada do quadro");
    } catch (err) {
      toast.error("Não foi possível remover", (err as Error).message);
    }
  };

  const active = items.filter((i) => i.stage !== "salva" && i.stage !== "encerrada").length;
  const inProcess = items.filter((i) => i.stage === "teste" || i.stage === "entrevista").length;
  const offers = items.filter((i) => i.stage === "proposta").length;

  return (
    <div className="animate-fade-up flex flex-col gap-6">
      <PageHeader
        eyebrow="Acompanhamento"
        title="Candidaturas"
        description="Arraste as vagas entre as etapas e anote o CV usado, a pretensão, o contato e o que aconteceu em cada processo."
      />

      <div className="grid grid-cols-3 gap-3 sm:max-w-xl">
        {[
          { label: "Em andamento", value: active },
          { label: "Teste ou entrevista", value: inProcess },
          { label: "Propostas", value: offers },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <p className="text-2xl font-bold tabular-nums">{s.value}</p>
            <p className="text-xs text-muted">{s.label}</p>
          </Card>
        ))}
      </div>

      {items.length === 0 ? (
        <Card>
          <EmptyState
            icon={<KanbanSquare />}
            title="Seu quadro está vazio"
            description="Abra uma vaga e clique em “Salvar” ou “Me candidatei”. Ela aparece aqui para você acompanhar o processo."
            action={<ButtonLink href="/vagas">Ver vagas</ButtonLink>}
          />
        </Card>
      ) : (
        // Rola para o lado no celular; cada coluna aceita soltar um cartão.
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6">
          {STAGES.map((stage) => {
            const info = STAGE_INFO[stage];
            const column = items.filter((i) => i.stage === stage);
            return (
              <section
                key={stage}
                aria-label={info.label}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOverStage(stage);
                }}
                onDragLeave={() => setOverStage((s) => (s === stage ? null : s))}
                onDrop={(e) => {
                  e.preventDefault();
                  setOverStage(null);
                  const id = Number(e.dataTransfer.getData("text/plain"));
                  if (id) void move(id, stage);
                }}
                className={cn(
                  "flex w-64 shrink-0 flex-col rounded-2xl border border-border bg-white/[0.02] p-2.5 transition",
                  overStage === stage && dragId !== null && "border-primary/50 bg-primary/[0.06]",
                )}
              >
                <header className="mb-2.5 flex items-center gap-2 px-1.5 pt-1">
                  <span className={cn("size-2 rounded-full", DOT[info.tone])} />
                  <h2 className="text-sm font-semibold">{info.label}</h2>
                  <span className="text-xs text-muted">{column.length}</span>
                </header>
                <p className="mb-2.5 px-1.5 text-[11px] text-muted">{info.hint}</p>
                <div className="flex min-h-24 flex-1 flex-col gap-2">
                  {column.map((item) => (
                    <BoardCard
                      key={item.job_id}
                      item={item}
                      dragging={dragId === item.job_id}
                      onOpen={() => setOpenId(item.job_id)}
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", String(item.job_id));
                        e.dataTransfer.effectAllowed = "move";
                        setDragId(item.job_id);
                        // Some quando o arrasto termina, mesmo fora de uma coluna.
                        e.currentTarget.addEventListener("dragend", () => setDragId(null), { once: true });
                      }}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <Modal
        open={opened !== null}
        onClose={() => setOpenId(null)}
        title={opened?.title ?? ""}
        description={opened ? [opened.company, opened.location].filter(Boolean).join(" · ") : undefined}
      >
        {opened && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap gap-2">
              <ButtonLink href={`/vagas/${opened.job_id}`} variant="secondary" size="sm">
                Abrir vaga
              </ButtonLink>
              {opened.url && (
                <ButtonLink href={opened.url} external variant="ghost" size="sm" icon={<ExternalLink className="size-3.5" />}>
                  Vaga original
                </ButtonLink>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto text-danger"
                onClick={() => remove(opened.job_id)}
                icon={<Trash2 className="size-3.5" />}
              >
                Tirar do quadro
              </Button>
            </div>
            <ApplicationForm
              key={opened.job_id}
              jobId={opened.job_id}
              application={opened}
              resumes={data.resumes}
              onSaved={({ application }) => {
                update(opened.job_id, application);
                void reload(); // atualiza a lista de CVs sugeridos
                setOpenId(null);
              }}
            />
          </div>
        )}
      </Modal>

      <p className="text-xs text-muted">
        Dica: no celular, toque no cartão para mudar a etapa. Vagas descartadas saem do quadro, mas a candidatura fica
        guardada e volta se você salvar a vaga de novo.{" "}
        <Link href="/vagas" className="text-primary hover:underline">
          Ver todas as vagas
        </Link>
      </p>
    </div>
  );
}
