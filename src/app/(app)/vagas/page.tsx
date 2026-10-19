"use client";

import { Inbox, Search, Sparkles, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { JobCard } from "@/components/job-card";
import { useJobActions } from "@/components/use-job-actions";
import { Button } from "@/components/ui/button";
import { EmptyState, Skeleton } from "@/components/ui/controls";
import { useApi } from "@/lib/api";
import { cn } from "@/lib/format";
import type { JobFilter, JobListItem } from "@/lib/types";

const TABS: { id: JobFilter; label: string }[] = [
  { id: "melhores", label: "Melhores" },
  { id: "todas", label: "Todas" },
  { id: "pendentes", label: "Sem análise" },
  { id: "salva", label: "Salvas" },
  { id: "candidatado", label: "Candidatei" },
  { id: "descartada", label: "Descartadas" },
];

const EMPTY_TEXT: Record<JobFilter, string> = {
  melhores: "Nenhuma vaga acima da sua nota mínima ainda. Busque mais vagas ou veja todas.",
  todas: "Você ainda não tem vagas. Busque nas suas fontes ou cole uma vaga.",
  pendentes: "Todas as vagas já foram analisadas.",
  salva: "Salve vagas para decidir depois. Elas aparecem aqui.",
  candidatado: "Quando marcar que se candidatou a uma vaga, ela aparece aqui.",
  descartada: "Vagas descartadas aparecem aqui.",
};

type ListResponse = { jobs: JobListItem[]; counts: Record<JobFilter, number>; minScore: number };

function JobsList() {
  const router = useRouter();
  const params = useSearchParams();
  const filter = (params.get("filtro") as JobFilter) || "todas";
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [debounced, setDebounced] = useState(query);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const path = `/jobs?filter=${filter}${debounced ? `&q=${encodeURIComponent(debounced)}` : ""}`;
  const { data, loading, error, reload } = useApi<ListResponse>(path);
  const { collect, analyze, collecting, analyzing } = useJobActions(reload);

  const setFilter = (f: JobFilter) => router.replace(`/vagas?filtro=${f}`, { scroll: false });

  return (
    <div className="animate-fade-up flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Vagas</h1>
          <p className="mt-1 text-muted">Todas as vagas encontradas, com a nota de compatibilidade.</p>
        </div>
        <div className="flex gap-2">
          {(data?.counts.pendentes ?? 0) > 0 && (
            <Button variant="secondary" onClick={analyze} loading={analyzing} icon={<Sparkles className="size-4" />}>
              Analisar {data?.counts.pendentes}
            </Button>
          )}
          <Button onClick={collect} loading={collecting} icon={<Search className="size-4" />}>
            Buscar vagas
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por cargo, empresa ou local"
            className="h-11 w-full rounded-xl border border-border bg-surface pr-10 pl-10 text-sm shadow-card outline-none focus:border-primary focus:ring-4 focus:ring-[var(--ring)]"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded p-1 text-muted hover:text-text"
              aria-label="Limpar busca"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition",
                filter === t.id ? "bg-text text-bg" : "border border-border bg-surface text-muted hover:text-text",
              )}
            >
              {t.label}
              {data && (
                <span className={cn("text-xs tabular-nums", filter === t.id ? "opacity-70" : "opacity-60")}>
                  {data.counts[t.id]}
                </span>
              )}
            </button>
          ))}
        </div>
        {filter === "melhores" && data && (
          <p className="text-xs text-muted">Mostrando vagas com nota {data.minScore} ou mais. Você muda isso em Configurações.</p>
        )}
      </div>

      {error && !data ? (
        <div className="rounded-2xl border border-dashed border-border">
          <EmptyState
            icon={<Inbox />}
            title="Não foi possível carregar as vagas"
            description={error}
            action={<Button variant="secondary" onClick={reload}>Tentar de novo</Button>}
          />
        </div>
      ) : loading && !data ? (
        <div className="flex flex-col gap-2.5">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : data && data.jobs.length > 0 ? (
        <div className={cn("flex flex-col gap-2.5 transition-opacity", loading && "opacity-60")}>
          {data.jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border">
          <EmptyState
            icon={<Inbox />}
            title={debounced ? "Nada encontrado" : "Nenhuma vaga aqui"}
            description={debounced ? `Nenhuma vaga com “${debounced}” neste filtro.` : EMPTY_TEXT[filter]}
            action={
              !debounced && (filter === "todas" || filter === "melhores") ? (
                <Button onClick={collect} loading={collecting} icon={<Search className="size-4" />}>
                  Buscar vagas agora
                </Button>
              ) : undefined
            }
          />
        </div>
      )}
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense>
      <JobsList />
    </Suspense>
  );
}
