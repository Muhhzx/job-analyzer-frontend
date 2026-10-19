"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "./ui/toast";

type CollectResult = { results: { source: string; found: number; added: number; error?: string }[]; added: number };
type AnalyzeResult = { done: number; withAi: number; errors: string[]; remaining: number };

/** Ações de "buscar vagas" e "analisar pendentes" com aviso do resultado. */
export function useJobActions(onDone: () => void) {
  const toast = useToast();
  const [collecting, setCollecting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const collect = async () => {
    setCollecting(true);
    try {
      const r = await api<CollectResult>("/jobs/collect", { method: "POST" });
      const failed = r.results.filter((x) => x.error);
      const detail = r.results.map((x) => (x.error ? `${x.source}: falhou` : `${x.source}: ${x.added}`)).join(" · ");
      if (r.added > 0) toast.success(`${r.added} vagas novas encontradas`, detail);
      else if (failed.length === r.results.length) toast.error("Não foi possível buscar vagas", failed[0]?.error);
      else toast.info("Nenhuma vaga nova desta vez", detail);
      onDone();
    } catch (err) {
      toast.error("Não foi possível buscar vagas", (err as Error).message);
    } finally {
      setCollecting(false);
    }
  };

  const analyze = async () => {
    setAnalyzing(true);
    try {
      const r = await api<AnalyzeResult>("/jobs/analyze-pending", { method: "POST" });
      if (r.errors.length) toast.error(`${r.errors.length} análises falharam`, r.errors[0]);
      else
        toast.success(
          `${r.done} vagas analisadas`,
          `${r.withAi} com IA · ${r.done - r.withAi} filtradas sem custo${r.remaining ? ` · faltam ${r.remaining}` : ""}`,
        );
      onDone();
    } catch (err) {
      toast.error("Não foi possível analisar", (err as Error).message);
    } finally {
      setAnalyzing(false);
    }
  };

  return { collect, analyze, collecting, analyzing };
}
