"use client";

import {
  ArrowDown,
  Bell,
  BrainCircuit,
  Filter,
  Gauge,
  Lock,
  MousePointerClick,
  Settings2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useApi } from "@/lib/api";
import { cn } from "@/lib/format";
import type { Dashboard } from "@/lib/types";

const TRIGGERS = [
  { title: "Analisar pendentes", text: "Botão no Início e em Vagas. Analisa até 10 vagas por clique." },
  { title: "Analisar de novo", text: "Na página de uma vaga. Pula o pré-filtro, porque foi você que pediu." },
  { title: "Analisar vaga", text: "Quando você cola uma vaga (LinkedIn etc.). Também pula o pré-filtro." },
  { title: "Busca automática", text: "Só se a “análise automática” estiver ligada em Configurações." },
];

const SCALE = [
  { range: "85 a 100", label: "Combina muito", text: "Vale se candidatar já.", tone: "success" as const },
  { range: "70 a 84", label: "Boa combinação", text: "Atende o principal, com poucas lacunas.", tone: "primary" as const },
  { range: "45 a 69", label: "Combina em parte", text: "Tem lacunas importantes ou algum conflito.", tone: "warning" as const },
  { range: "0 a 44", label: "Combina pouco", text: "Falta muito ou bate de frente com o que você não aceita.", tone: "danger" as const },
];

const CRITERIA = [
  "Age como um recrutador técnico experiente e cita requisitos concretos da vaga, sem elogios genéricos.",
  "Dá mais peso aos requisitos obrigatórios do que aos desejáveis.",
  "Baixa bastante a nota quando a vaga conflita com o que você não aceita, local, modelo de trabalho ou salário.",
  "Responde em português, de forma curta e direta.",
];

function Step({
  n,
  icon,
  title,
  where,
  children,
  last,
}: {
  n: number;
  icon: React.ReactNode;
  title: string;
  where: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <>
      <Card className="p-5">
        <div className="flex items-start gap-4">
          <div className="relative flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary [&_svg]:size-5">
            {icon}
            <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-on-primary">
              {n}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold">{title}</h3>
              <Badge>{where}</Badge>
            </div>
            <div className="mt-2 text-sm leading-relaxed text-muted">{children}</div>
          </div>
        </div>
      </Card>
      {!last && (
        <div className="flex justify-center text-primary/60">
          <ArrowDown className="size-5" />
        </div>
      )}
    </>
  );
}

export default function HowItWorksPage() {
  const { data } = useApi<Dashboard>("/dashboard");
  const prefilter = data?.ai.prefilterMinScore ?? 30;
  const limits = data?.ai.usage;

  return (
    <div className="animate-fade-up mx-auto flex max-w-3xl flex-col gap-8 pb-12">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Como funciona a análise</h1>
        <p className="mt-2 leading-relaxed text-muted">
          Cada vaga ganha uma nota de 0 a 100 dizendo o quanto ela combina com você. Aqui está o caminho que ela percorre
          e o critério usado.
        </p>
      </div>

      {data && (
        <Card className="flex flex-wrap gap-x-8 gap-y-3 p-5 text-sm">
          <div>
            <p className="text-xs text-muted">IA</p>
            <p className="font-medium">{data.ai.enabled ? data.ai.model : "Desligada (sem chave)"}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Corte do pré-filtro</p>
            <p className="font-medium">Nota {prefilter}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Te avisa a partir de</p>
            <p className="font-medium">Nota {data.minScore}</p>
          </div>
          {limits && (
            <div>
              <p className="text-xs text-muted">Limite do mês</p>
              <p className="font-medium">
                {limits.maxAnalyses} análises ou US$ {limits.budgetUsd.toFixed(2)}
              </p>
            </div>
          )}
        </Card>
      )}

      <section className="flex flex-col gap-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <MousePointerClick className="size-5 text-primary" /> Quando a análise acontece
        </h2>
        <p className="-mt-2 text-sm text-muted">Só nestes casos. Fora deles, nada é enviado para a IA.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {TRIGGERS.map((t) => (
            <Card key={t.title} className="p-4">
              <p className="font-medium">{t.title}</p>
              <p className="mt-1 text-sm text-muted">{t.text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Sparkles className="size-5 text-primary" /> O caminho de cada vaga
        </h2>
        <div className="flex flex-col gap-2">
          <Step n={1} icon={<Filter />} title="Pré-filtro por palavras-chave" where="No servidor · grátis">
            <p>Uma nota rápida, só procurando palavras no texto da vaga:</p>
            <ul className="mt-2 flex flex-col gap-1.5">
              <li>
                <b className="text-text">Habilidades:</b> quantas das suas aparecem na vaga. Vale até 70 pontos (5
                habilidades encontradas já dão o máximo).
              </li>
              <li>
                <b className="text-text">Cargo:</b> +30 se o título bate com um cargo desejado; +10 se não.
              </li>
              <li>
                <b className="text-text">O que você não aceita:</b> −25 para cada item que aparece na vaga.
              </li>
            </ul>
            <p className="mt-2">
              Abaixo de <b className="text-primary">{prefilter}</b>, a vaga para aqui e fica com essa nota. Assim você não
              gasta com vaga que claramente não combina.
            </p>
          </Step>
          <Step n={2} icon={<Gauge />} title="Limite do mês" where="No servidor">
            Se o limite de análises ou de gasto do mês já foi atingido, a vaga também fica só com a nota por
            palavras-chave. Tudo volta ao normal no dia 1º.
          </Step>
          <Step n={3} icon={<BrainCircuit />} title="Análise com IA" where="Claude, nos servidores da Anthropic" last>
            <p>O servidor envia o seu perfil e a vaga para o Claude, junto com o critério abaixo, e recebe de volta:</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {["Nota 0–100", "Resumo", "O que combina", "O que falta", "Pontos de atenção", "Dicas de candidatura"].map(
                (x) => (
                  <Badge key={x} tone="primary">
                    {x}
                  </Badge>
                ),
              )}
            </div>
          </Step>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <ShieldCheck className="size-5 text-primary" /> O critério da IA
        </h2>
        <Card className="p-5">
          <ul className="flex flex-col gap-2.5">
            {CRITERIA.map((c) => (
              <li key={c} className="flex gap-3 text-sm leading-relaxed">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                {c}
              </li>
            ))}
          </ul>
        </Card>
        <div className="grid gap-3 sm:grid-cols-2">
          {SCALE.map((s) => (
            <Card key={s.range} className="flex items-start gap-3 p-4">
              <span
                className={cn(
                  "shrink-0 rounded-lg px-2 py-1 text-sm font-semibold tabular-nums",
                  {
                    success: "bg-success-soft text-success",
                    primary: "bg-primary-soft text-primary",
                    warning: "bg-warning-soft text-warning",
                    danger: "bg-danger-soft text-danger",
                  }[s.tone],
                )}
              >
                {s.range}
              </span>
              <div>
                <p className="font-medium">{s.label}</p>
                <p className="text-sm text-muted">{s.text}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Lock className="size-5 text-primary" /> O que é enviado para a IA
        </h2>
        <Card>
          <div className="grid gap-5 p-5 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-medium">Do seu perfil</p>
              <p className="text-sm text-muted">
                Resumo, senioridade, cargos, habilidades, experiência, idiomas, locais, modelo de trabalho, salário, o
                que você não aceita e o <b className="text-text">currículo</b>.
              </p>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">Da vaga</p>
              <p className="text-sm text-muted">Título, empresa, local e a descrição completa.</p>
            </div>
          </div>
          <div className="border-t border-border bg-warning-soft/50 px-5 py-3 text-sm text-warning">
            Seu currículo vai junto em cada análise com IA. Tire do currículo o que você não quer enviar, como
            telefone, endereço ou documentos.
          </div>
        </Card>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Bell className="size-5 text-primary" /> Depois da análise
        </h2>
        <Card className="p-5 text-sm leading-relaxed text-muted">
          O resultado fica salvo e aparece na página da vaga. Se a nota for igual ou maior que a sua nota mínima
          {data ? ` (hoje ${data.minScore})` : ""}, você recebe uma notificação no sino e a vaga entra em{" "}
          <Link href="/vagas?filtro=melhores" className="font-medium text-primary hover:underline">
            Melhores
          </Link>
          .
        </Card>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Settings2 className="size-5 text-primary" /> Como ajustar
        </h2>
        <Card className="divide-y divide-border">
          {[
            ["Nota mínima para te avisar", "Configurações → Quando te avisar", "/configuracoes"],
            ["Busca e análise automáticas", "Configurações → Automação", "/configuracoes#automacao"],
            ["O que a IA leva em conta sobre você", "Meu perfil (quanto mais completo, melhor)", "/perfil"],
          ].map(([what, where, href]) => (
            <Link key={what} href={href} className="flex items-center justify-between gap-4 px-5 py-3.5 transition hover:bg-surface-2">
              <span className="text-sm font-medium">{what}</span>
              <span className="text-right text-sm text-muted">{where}</span>
            </Link>
          ))}
          <div className="flex items-center justify-between gap-4 px-5 py-3.5">
            <span className="text-sm font-medium">Corte do pré-filtro e limites do mês</span>
            <span className="text-right text-sm text-muted">
              Arquivo <code className="text-xs">job-analyzer-backend/.env</code>
            </span>
          </div>
        </Card>
      </section>
    </div>
  );
}
