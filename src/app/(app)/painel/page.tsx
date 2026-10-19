"use client";

import {
  ArrowRight,
  Bookmark,
  Briefcase,
  Check,
  Clock,
  Search,
  Send,
  Sparkles,
  Star,
  Wand2,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { JobCard } from "@/components/job-card";
import { useJobActions } from "@/components/use-job-actions";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState, ProgressBar, Skeleton } from "@/components/ui/controls";
import { useApi } from "@/lib/api";
import { cn, formatDateTime, frequencyLabel } from "@/lib/format";
import type { Dashboard } from "@/lib/types";

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
}

function Stat({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: number; href: string }) {
  return (
    <Link href={href} className="group rounded-2xl border border-border bg-surface p-4 shadow-card transition hover:border-primary/40">
      <div className="flex items-center justify-between text-muted [&_svg]:size-4">
        <span className="text-xs font-medium">{label}</span>
        {icon}
      </div>
      <div className="mt-2 text-2xl font-semibold tabular-nums group-hover:text-primary">{value}</div>
    </Link>
  );
}

function Onboarding({ data }: { data: Dashboard }) {
  const steps = [
    {
      done: data.completion.percent >= 70,
      title: "Complete seu perfil",
      text:
        data.completion.missing.length > 0
          ? `Falta: ${data.completion.missing.slice(0, 3).join(", ")}`
          : "Tudo preenchido",
      href: "/perfil",
      cta: "Preencher",
    },
    {
      done: data.sourcesConfigured > 0,
      title: "Escolha onde buscar vagas",
      text: "Palavras-chave e empresas que você quer acompanhar.",
      href: "/configuracoes#fontes",
      cta: "Configurar",
    },
    {
      done: data.stats.total > 0,
      title: "Faça sua primeira busca",
      text: "Clique em “Buscar vagas agora” aqui embaixo.",
      href: "#acoes",
      cta: "Ver",
    },
    {
      done: data.automation.collectHours > 0,
      title: "Decida se quer automático",
      text: "Opcional: buscar sozinho no horário que você escolher.",
      href: "/configuracoes#automacao",
      cta: "Decidir",
    },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  if (doneCount === steps.length) return null;

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-primary-soft/60 px-5 py-4">
        <div>
          <h2 className="font-semibold">Primeiros passos</h2>
          <p className="text-sm text-muted">
            {doneCount} de {steps.length} concluídos
          </p>
        </div>
        <div className="w-40">
          <ProgressBar value={doneCount} max={steps.length} />
        </div>
      </div>
      <ol className="divide-y divide-border">
        {steps.map((s, i) => (
          <li key={s.title} className="flex items-center gap-4 px-5 py-3.5">
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                s.done ? "bg-success text-on-primary" : "border border-border text-muted",
              )}
            >
              {s.done ? <Check className="size-4" /> : i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className={cn("text-sm font-medium", s.done && "text-muted line-through")}>{s.title}</p>
              {!s.done && <p className="text-xs text-muted">{s.text}</p>}
            </div>
            {!s.done && (
              <ButtonLink href={s.href} size="sm" variant="secondary">
                {s.cta}
              </ButtonLink>
            )}
          </li>
        ))}
      </ol>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, loading, reload } = useApi<Dashboard>("/dashboard");
  const { collect, analyze, collecting, analyzing } = useJobActions(reload);

  if (loading && !data) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }
  if (!data) return null;

  const { stats, automation, ai } = data;
  const usageHigh = ai.usage.analyses / ai.usage.maxAnalyses >= 0.9 || ai.usage.costUsd / ai.usage.budgetUsd >= 0.9;

  return (
    <div className="animate-fade-up flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {greeting()}, {user?.name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-muted">
          {stats.good > 0
            ? `Você tem ${stats.good} ${stats.good === 1 ? "vaga" : "vagas"} com nota ${data.minScore}+ esperando por você.`
            : "Aqui está o resumo da sua busca."}
        </p>
      </div>

      <Onboarding data={data} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={<Briefcase />} label="Vagas encontradas" value={stats.total} href="/vagas?filtro=todas" />
        <Stat icon={<Star />} label={`Nota ${data.minScore}+`} value={stats.good} href="/vagas?filtro=melhores" />
        <Stat icon={<Bookmark />} label="Salvas" value={stats.saved} href="/vagas?filtro=salva" />
        <Stat icon={<Send />} label="Candidaturas" value={stats.applied} href="/vagas?filtro=candidatado" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card>
          <CardHeader
            title="Melhores vagas para você"
            description="Ordenadas pela compatibilidade com o seu perfil."
            icon={<Sparkles className="size-4.5" />}
            action={
              <Link href="/vagas?filtro=melhores" className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:flex">
                Ver todas <ArrowRight className="size-4" />
              </Link>
            }
          />
          <div className="flex flex-col gap-2.5 p-5">
            {data.topJobs.length === 0 ? (
              <EmptyState
                icon={<Search />}
                title="Nenhuma vaga analisada ainda"
                description="Busque vagas nas suas fontes ou cole uma vaga que você achou para ver a análise."
                action={
                  <Button onClick={collect} loading={collecting} icon={<Search className="size-4" />}>
                    Buscar vagas agora
                  </Button>
                }
              />
            ) : (
              data.topJobs.map((job) => <JobCard key={job.id} job={job} compact />)
            )}
          </div>
        </Card>

        <div className="flex flex-col gap-6">
          <Card id="acoes">
            <CardHeader title="Ações" icon={<Wand2 className="size-4.5" />} />
            <div className="flex flex-col gap-2.5 p-5">
              <Button onClick={collect} loading={collecting} icon={<Search className="size-4" />} className="w-full">
                {collecting ? "Buscando vagas..." : "Buscar vagas agora"}
              </Button>
              <Button
                variant="secondary"
                onClick={analyze}
                loading={analyzing}
                disabled={data.pending === 0}
                icon={<Sparkles className="size-4" />}
                className="w-full"
              >
                {analyzing ? "Analisando..." : data.pending ? `Analisar ${data.pending} pendentes` : "Nada para analisar"}
              </Button>
              <p className="text-xs text-muted">
                Vagas com pouca compatibilidade são filtradas antes da IA, sem custo.
              </p>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Automação"
              icon={<Clock className="size-4.5" />}
              action={
                <Link href="/configuracoes#automacao" className="text-sm font-medium text-primary hover:underline">
                  Alterar
                </Link>
              }
            />
            <div className="flex flex-col gap-2 p-5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Busca</span>
                <span className="font-medium">{frequencyLabel(automation.collectHours)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Análise automática</span>
                <span className="font-medium">{automation.collectHours ? (automation.autoAnalyze ? "Ligada" : "Desligada") : "—"}</span>
              </div>
              {automation.nextRun && (
                <div className="flex justify-between">
                  <span className="text-muted">Próxima busca</span>
                  <span className="font-medium">
                    {automation.nextRun === "em breve" ? "em alguns minutos" : formatDateTime(automation.nextRun)}
                  </span>
                </div>
              )}
              {!automation.collectHours && (
                <p className="mt-1 text-xs text-muted">Nada roda sozinho: o sistema só busca quando você clicar.</p>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title="Uso da IA no mês" icon={<Sparkles className="size-4.5" />} />
            <div className="flex flex-col gap-4 p-5">
              {ai.enabled ? (
                <>
                  <div>
                    <div className="mb-1.5 flex justify-between text-xs">
                      <span className="text-muted">Análises</span>
                      <span className="font-medium tabular-nums">
                        {ai.usage.analyses} / {ai.usage.maxAnalyses}
                      </span>
                    </div>
                    <ProgressBar value={ai.usage.analyses} max={ai.usage.maxAnalyses} />
                  </div>
                  <div>
                    <div className="mb-1.5 flex justify-between text-xs">
                      <span className="text-muted">Gasto</span>
                      <span className="font-medium tabular-nums">
                        US$ {ai.usage.costUsd.toFixed(3)} / {ai.usage.budgetUsd.toFixed(2)}
                      </span>
                    </div>
                    <ProgressBar value={ai.usage.costUsd} max={ai.usage.budgetUsd} />
                  </div>
                  {usageHigh && (
                    <p className="text-xs text-warning">Perto do limite. Depois dele, a análise volta a ser só por palavras-chave.</p>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted">
                  IA desligada. Coloque a <code className="rounded bg-surface-2 px-1 text-xs">ANTHROPIC_API_KEY</code> no{" "}
                  <code className="rounded bg-surface-2 px-1 text-xs">job-analyzer-backend/.env</code>. Até lá, a análise é por
                  palavras-chave.
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
