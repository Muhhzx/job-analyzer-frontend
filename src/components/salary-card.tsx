import { Wallet } from "lucide-react";
import type { SalaryEstimate } from "@/lib/types";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";

function money(value: number, currency: SalaryEstimate["currency"]) {
  return value.toLocaleString("pt-BR", { style: "currency", currency, maximumFractionDigits: 0 });
}

const VS_TONE = {
  "acima da pretensão": "success",
  "dentro da pretensão": "primary",
  "abaixo da pretensão": "danger",
  "pretensão não informada": "neutral",
} as const;

/** Faixa salarial da vaga: a informada pela empresa ou uma estimativa da IA (sempre identificada). */
export function SalaryCard({ salary }: { salary: SalaryEstimate }) {
  const informed = salary.source === "informado na vaga";
  const range = salary.min === salary.max ? money(salary.min, salary.currency) : `${money(salary.min, salary.currency)} – ${money(salary.max, salary.currency)}`;

  return (
    <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
        <Wallet className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-semibold">Salário</h2>
          <Badge tone={informed ? "success" : "warning"}>{informed ? "Informado na vaga" : "Estimativa da IA"}</Badge>
          {salary.contract !== "não informado" && <Badge>{salary.contract}</Badge>}
        </div>
        <p className="mt-1.5 text-xl font-semibold tabular-nums">
          {range} <span className="text-sm font-normal text-muted">{salary.period}</span>
        </p>
        <p className="mt-1 text-sm text-muted">{salary.basis}</p>
        {!informed && (
          <p className="mt-1 text-xs text-muted">
            Estimativa de mercado feita pela IA, não um valor da empresa. Use como referência para a negociação.
          </p>
        )}
      </div>
      <Badge tone={VS_TONE[salary.vs_candidate]} className="self-start sm:self-center">
        {salary.vs_candidate}
      </Badge>
    </Card>
  );
}
