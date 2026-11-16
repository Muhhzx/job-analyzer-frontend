"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "./ui/toast";

type CollectResult = {
  results: { source: string; found: number; added: number; warnings: string[]; error?: string }[];
  /** Vagas novas no total. */
  added: number;
  /** Quantas aparecem na tela (nota ≥ minVisibleScore). */
  visible: number;
  /** Quantas ficaram escondidas (nota baixa ou nível fora do que você quer ver). */
  hidden: number;
  /** Destas, quantas por senioridade. */
  hiddenByLevel: number;
  /** Destas, quantas pelos filtros de bloqueio. */
  hiddenByBlock: number;
  minVisibleScore: number;
};

/**
 * Ação de "buscar vagas" com aviso do resultado.
 * As vagas já chegam com a nota grátis; a análise com IA é feita vaga por vaga, na página da vaga.
 */
export function useJobActions(onDone: () => void) {
  const toast = useToast();
  const [collecting, setCollecting] = useState(false);

  const collect = async () => {
    setCollecting(true);
    try {
      const r = await api<CollectResult>("/jobs/collect", { method: "POST" });
      const failed = r.results.filter((x) => x.error);
      const detail = r.results.map((x) => (x.error ? `${x.source}: falhou` : `${x.source}: ${x.added}`)).join(" · ");
      // Uma vaga pode cair em mais de um motivo; o resto é por nota baixa.
      const byScore = Math.max(0, r.hidden - r.hiddenByLevel - r.hiddenByBlock);
      const hiddenParts = [
        r.hiddenByBlock > 0 && `${r.hiddenByBlock} pelos seus filtros de bloqueio`,
        r.hiddenByLevel > 0 && `${r.hiddenByLevel} de nível fora do que você quer ver`,
        byScore > 0 && `${byScore} com nota abaixo de ${r.minVisibleScore}`,
      ].filter(Boolean);
      const hiddenNote = hiddenParts.length ? ` Escondidas: ${hiddenParts.join(", ")}.` : "";
      if (r.visible > 0) {
        toast.success(`${r.visible} vagas novas, já com a nota grátis`, `${detail}.${hiddenNote}`);
      } else if (failed.length === r.results.length) {
        toast.error("Não foi possível buscar vagas", failed[0]?.error);
      } else if (r.added > 0) {
        toast.info("Nenhuma vaga nova com nota suficiente", `${detail}.${hiddenNote}`);
      } else {
        toast.info("Nenhuma vaga nova desta vez", `${detail}. As já encontradas antes não se repetem.`);
      }

      // Avisos (ex.: empresa que não existe no Greenhouse) não impedem a busca, mas você precisa saber.
      const warnings = r.results.flatMap((x) => x.warnings.map((w) => `${x.source}: ${w}`));
      if (warnings.length) {
        toast.error(
          `${warnings.length} ${warnings.length === 1 ? "item" : "itens"} da sua lista não funcionaram`,
          warnings.slice(0, 4).join(" · ") + (warnings.length > 4 ? ` · e mais ${warnings.length - 4}` : ""),
        );
      }
      onDone();
    } catch (err) {
      toast.error("Não foi possível buscar vagas", (err as Error).message);
    } finally {
      setCollecting(false);
    }
  };

  return { collect, collecting };
}
