"use client";

import { Bookmark, Briefcase, Building2, Inbox, Search, Send, Sparkles, Star, Trash2, X, Zap } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { JobCard } from "@/components/job-card";
import { Pagination } from "@/components/pagination";
import { useJobActions } from "@/components/use-job-actions";
import { Button } from "@/components/ui/button";
import { EmptyState, Skeleton } from "@/components/ui/controls";
import { useApi } from "@/lib/api";
import { cn } from "@/lib/format";
import type { JobFilter, JobListResponse } from "@/lib/types";

/** Cartões de controle: cada um é um filtro de situação, com a contagem. */
const STATUS_CARDS: { id: JobFilter; label: string; icon: React.ReactNode; tone: string }[] = [
  { id: "todas", label: "Todas", icon: <Briefcase />, tone: "text-text" },
  { id: "melhores", label: "Melhores", icon: <Star />, tone: "text-primary" },
  { id: "nova", label: "Novas", icon: <Zap />, tone: "text-text" },
  { id: "ia", label: "Com análise de IA", icon: <Sparkles />, tone: "text-primary" },
  { id: "salva", label: "Salvas", icon: <Bookmark />, tone: "text-primary" },
  { id: "candidatado", label: "Candidatei", icon: <Send />, tone: "text-success" },
  { id: "descartada", label: "Descartadas", icon: <Trash2 />, tone: "text-muted" },
];

const EMPTY_TEXT: Record<JobFilter, string> = {
  melhores: "Nenhuma vaga acima da sua nota mínima ainda. Busque mais vagas ou veja todas.",
  todas: "Você ainda não tem vagas. Busque nas suas fontes ou cole uma vaga.",
  nova: "Nenhuma vaga nova. Todas já foram salvas, candidatadas ou descartadas.",
  ia: "Nenhuma vaga analisada com IA ainda. Abra uma vaga e clique em “Analisar com IA”.",
  salva: "Salve vagas para decidir depois. Elas aparecem aqui.",
  candidatado: "Quando marcar que se candidatou a uma vaga, ela aparece aqui.",
  descartada: "Vagas descartadas aparecem aqui.",
};

function JobsList() {
  const router = useRouter();
  const params = useSearchParams();

  // O estado dos filtros fica na URL: dá para voltar, recarregar e compartilhar o link.
  const filter = (params.get("filtro") as JobFilter) || "todas";
  const company = params.get("empresa") ?? "";
  const page = Number(params.get("pagina") ?? 1);

  const [query, setQuery] = useState(params.get("q") ?? "");
  const [debounced, setDebounced] = useState(query);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  /** Atualiza a URL. Mudar qualquer filtro volta para a página 1. */
  const update = (changes: Record<string, string | number | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(changes)) {
      if (v === null || v === "" || (k === "filtro" && v === "todas")) next.delete(k);
      else next.set(k, String(v));
    }
    if (!("pagina" in changes)) next.delete("pagina");
    router.replace(`/vagas${next.size ? `?${next}` : ""}`, { scroll: false });
  };

  // Busca digitada também vai para a URL (depois da pausa de digitação).
  useEffect(() => {
    if ((params.get("q") ?? "") !== debounced) update({ q: debounced || null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const apiParams = new URLSearchParams({ filter, page: String(page) });
  if (company) apiParams.set("company", company);
  if (debounced) apiParams.set("q", debounced);
  const { data, loading, error, reload } = useApi<JobListResponse>(`/jobs?${apiParams}`);
  const { collect, collecting } = useJobActions(reload);

  const goToPage = (p: number) => {
    update({ pagina: p > 1 ? p : null });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const hasFilters = Boolean(company || debounced || filter !== "todas");

  return (
    <div className="animate-fade-up flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Vagas</h1>
          <p className="mt-1 text-muted">
            Cada vaga chega com a prévia grátis. Abra uma para ver os matches e, se quiser, analisar com IA.
          </p>
        </div>
        <Button onClick={collect} loading={collecting} icon={<Search className="size-4" />}>
          Buscar vagas
        </Button>
      </div>

      {/* Painel de controle: clique num cartão para filtrar. */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-7">
        {STATUS_CARDS.map((card) => {
          const active = filter === card.id;
          return (
            <button
              key={card.id}
              onClick={() => update({ filtro: card.id })}
              aria-pressed={active}
              className={cn(
                "rounded-2xl border p-3.5 text-left transition",
                active
                  ? "border-primary bg-primary-soft ring-4 ring-[var(--ring)]/40"
                  : "border-border bg-surface hover:border-primary/40",
              )}
            >
              <div className={cn("flex items-center gap-1.5 text-xs font-medium [&_svg]:size-3.5", active ? "text-primary" : "text-muted")}>
                {card.icon}
                <span className="truncate">{card.label}</span>
              </div>
              <div className={cn("mt-1.5 text-2xl font-semibold tabular-nums", active ? "text-primary" : card.tone)}>
                {data ? data.counts[card.id] : "–"}
              </div>
            </button>
          );
        })}
      </div>

      {/* Busca + filtro por empresa */}
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <div className="relative flex-1">
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
        <div className="relative sm:w-72">
          <Building2 className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
          <select
            value={company}
            onChange={(e) => update({ empresa: e.target.value || null })}
            aria-label="Filtrar por empresa"
            className="h-11 w-full appearance-none rounded-xl border border-border bg-surface pr-8 pl-10 text-sm shadow-card outline-none focus:border-primary focus:ring-4 focus:ring-[var(--ring)]"
          >
            <option value="">Todas as empresas{data ? ` (${data.companies.length})` : ""}</option>
            {/* Mantém a empresa escolhida na lista mesmo se ela não tiver vagas no filtro atual. */}
            {company && data && !data.companies.some((c) => c.name === company) && (
              <option value={company}>{company} (0)</option>
            )}
            {data?.companies.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name} ({c.count})
              </option>
            ))}
          </select>
        </div>
      </div>

      {hasFilters && (
        <div className="-mt-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted">{data ? `${data.total} vagas encontradas` : "Filtrando..."}</span>
          <button
            onClick={() => {
              setQuery("");
              router.replace("/vagas", { scroll: false });
            }}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-primary hover:bg-primary-soft"
          >
            <X className="size-3.5" /> Limpar filtros
          </button>
          {filter === "melhores" && data && (
            <span className="text-xs text-muted">· nota {data.minScore} ou mais (muda em Configurações)</span>
          )}
        </div>
      )}

      {error && !data ? (
        <div className="rounded-2xl border border-dashed border-border">
          <EmptyState
            icon={<Inbox />}
            title="Não foi possível carregar as vagas"
            description={error}
            action={
              <Button variant="secondary" onClick={reload}>
                Tentar de novo
              </Button>
            }
          />
        </div>
      ) : loading && !data ? (
        <div className="flex flex-col gap-2.5">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : data && data.jobs.length > 0 ? (
        <>
          <div className={cn("flex flex-col gap-2.5 transition-opacity", loading && "opacity-60")}>
            {data.jobs.map((job) => (
              <JobCard key={job.id} job={job} prefilterMinScore={data.prefilterMinScore} />
            ))}
          </div>
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            total={data.total}
            pageSize={data.pageSize}
            onChange={goToPage}
          />
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-border">
          <EmptyState
            icon={<Inbox />}
            title={hasFilters && filter === "todas" ? "Nada encontrado" : "Nenhuma vaga aqui"}
            description={
              debounced || company ? "Nenhuma vaga com esses filtros. Tente limpar a busca ou a empresa." : EMPTY_TEXT[filter]
            }
            action={
              !debounced && !company && (filter === "todas" || filter === "melhores") ? (
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
