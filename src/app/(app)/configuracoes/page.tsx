"use client";

import { Bell, Building2, Clock, Globe, KeyRound, LogOut, Radar, Sparkles } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { SaveBar } from "@/components/save-bar";
import { useProfileForm } from "@/components/use-profile-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { ChipInput } from "@/components/ui/chip-input";
import { ProgressBar, Segmented, Skeleton, Switch } from "@/components/ui/controls";
import { Field } from "@/components/ui/field";
import { useApi } from "@/lib/api";
import { formatDateTime, splitList } from "@/lib/format";
import type { Dashboard } from "@/lib/types";

const FREQUENCIES = [
  { value: 0, label: "Manual", hint: "Só quando eu clicar" },
  { value: 6, label: "A cada 6h", hint: "4x por dia" },
  { value: 12, label: "A cada 12h", hint: "2x por dia" },
  { value: 24, label: "1x por dia", hint: "Recomendado" },
  { value: 48, label: "A cada 2 dias", hint: "" },
  { value: 168, label: "1x por semana", hint: "" },
];

function SourceRow({
  icon,
  name,
  description,
  active,
  children,
}: {
  icon: React.ReactNode;
  name: string;
  description: React.ReactNode;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-muted [&_svg]:size-4.5">
            {icon}
          </div>
          <div>
            <p className="font-medium">{name}</p>
            <p className="text-sm text-muted">{description}</p>
          </div>
        </div>
        <Badge tone={active ? "success" : "neutral"}>{active ? "Ativa" : "Desligada"}</Badge>
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { form, loading, set, save, saving, dirty, reset } = useProfileForm();
  const { data: dash } = useApi<Dashboard>("/dashboard");

  if (loading || !form) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-80" />
      </div>
    );
  }

  const usage = dash?.ai.usage;

  return (
    <div className="animate-fade-up mx-auto flex max-w-3xl flex-col gap-6 pb-24">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Configurações</h1>
        <p className="mt-1 text-muted">Onde buscar vagas, quando buscar e quando te avisar.</p>
      </div>

      <Card id="fontes" className="scroll-mt-24">
        <CardHeader
          title="Onde buscar vagas"
          description="Ligue as fontes preenchendo o que cada uma precisa."
          icon={<Radar className="size-4.5" />}
        />
        <div className="flex flex-col gap-4 p-5">
          <SourceRow
            icon={<Globe />}
            name="Gupy · GitHub · Remotive"
            description="Gupy: empresas brasileiras. GitHub: vagas de tecnologia da comunidade (backend-br, frontendbr). Remotive: remotas do mundo todo. Todas usam as palavras-chave abaixo."
            active={splitList(form.search_keywords).length > 0}
          >
            <Field
              label="Palavras-chave"
              htmlFor="search_keywords"
              hint="Só as 5 primeiras são usadas na busca: coloque as mais importantes no começo. Também filtram as vagas do Greenhouse e do Lever."
            >
              <ChipInput
                id="search_keywords"
                value={form.search_keywords}
                onChange={(v) => set("search_keywords", v)}
                placeholder="react, node, full stack..."
              />
            </Field>
          </SourceRow>
          <SourceRow
            icon={<Building2 />}
            name="Greenhouse"
            description={
              <>
                Site de carreiras de empresas. Use o nome que aparece em <code className="text-xs">boards.greenhouse.io/nome</code>.
              </>
            }
            active={splitList(form.greenhouse_boards).length > 0}
          >
            <ChipInput
              id="greenhouse_boards"
              value={form.greenhouse_boards}
              onChange={(v) => set("greenhouse_boards", v)}
              placeholder="nubank, gitlab..."
              suggestions={["nubank", "gitlab", "stone", "quintoandar"]}
            />
          </SourceRow>
          <SourceRow
            icon={<Building2 />}
            name="Lever"
            description={
              <>
                Site de carreiras de empresas. Use o nome que aparece em <code className="text-xs">jobs.lever.co/nome</code>.
              </>
            }
            active={splitList(form.lever_boards).length > 0}
          >
            <ChipInput
              id="lever_boards"
              value={form.lever_boards}
              onChange={(v) => set("lever_boards", v)}
              placeholder="nome-da-empresa"
            />
          </SourceRow>
          <p className="text-xs text-muted">
            Achou uma vaga no LinkedIn ou em outro site? Use o botão <b>Analisar vaga</b> no topo da tela e cole o texto.
          </p>
        </div>
      </Card>

      <Card id="automacao" className="scroll-mt-24">
        <CardHeader
          title="Automação"
          description="Você decide se o sistema trabalha sozinho."
          icon={<Clock className="size-4.5" />}
        />
        <div className="flex flex-col gap-6 p-5">
          <Field label="Buscar vagas novas">
            <Segmented value={form.auto_collect_hours} onChange={(v) => set("auto_collect_hours", v)} options={FREQUENCIES} />
          </Field>
          {form.last_auto_run && (
            <p className="-mt-3 text-xs text-muted">Última busca automática: {formatDateTime(form.last_auto_run)}</p>
          )}
          <div className="flex items-start justify-between gap-4 rounded-2xl bg-surface-2 p-4">
            <div>
              <label htmlFor="auto_analyze" className="text-sm font-medium">
                Analisar automaticamente
              </label>
              <p className="mt-0.5 text-sm text-muted">
                As vagas da busca automática já chegam com nota. Desligado, elas esperam você clicar em “Analisar”.
              </p>
            </div>
            <Switch
              id="auto_analyze"
              label="Analisar automaticamente"
              checked={form.auto_analyze}
              onChange={(v) => set("auto_analyze", v)}
            />
          </div>
          {form.auto_collect_hours > 0 && (
            <p className="rounded-xl bg-warning-soft px-3 py-2 text-xs text-warning">
              A busca automática só roda enquanto o servidor (backend) estiver ligado.
            </p>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Quando te avisar"
          description="Vagas com nota igual ou maior viram notificação e aparecem em “Melhores”."
          icon={<Bell className="size-4.5" />}
        />
        <div className="p-5">
          <div className="mb-3 flex items-baseline justify-between">
            <span className="text-sm text-muted">Nota mínima</span>
            <span className="text-2xl font-semibold text-primary tabular-nums">{form.min_score}</span>
          </div>
          <input
            type="range"
            min={40}
            max={95}
            step={5}
            value={form.min_score}
            onChange={(e) => set("min_score", Number(e.target.value))}
            aria-label="Nota mínima para notificar"
            className="w-full accent-[var(--primary)]"
          />
          <div className="mt-1 flex justify-between text-xs text-muted">
            <span>Mais vagas</span>
            <span>Só as melhores</span>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Uso da IA"
          description="Limite mensal para controlar o gasto. Ao atingir, a análise volta a ser por palavras-chave."
          icon={<Sparkles className="size-4.5" />}
        />
        <div className="flex flex-col gap-4 p-5">
          {!dash ? (
            <Skeleton className="h-16" />
          ) : !dash.ai.enabled ? (
            <div className="flex gap-3 rounded-2xl bg-surface-2 p-4 text-sm">
              <KeyRound className="mt-0.5 size-4 shrink-0 text-muted" />
              <p className="text-muted">
                IA desligada. Para ligar, coloque sua <code className="text-xs">ANTHROPIC_API_KEY</code> no arquivo{" "}
                <code className="text-xs">job-analyzer-backend/.env</code> e reinicie o backend.
              </p>
            </div>
          ) : (
            usage && (
              <>
                <div>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="text-muted">Análises este mês</span>
                    <span className="font-medium tabular-nums">
                      {usage.analyses} de {usage.maxAnalyses}
                    </span>
                  </div>
                  <ProgressBar value={usage.analyses} max={usage.maxAnalyses} />
                </div>
                <div>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="text-muted">Gasto este mês</span>
                    <span className="font-medium tabular-nums">
                      US$ {usage.costUsd.toFixed(3)} de US$ {usage.budgetUsd.toFixed(2)}
                    </span>
                  </div>
                  <ProgressBar value={usage.costUsd} max={usage.budgetUsd} />
                </div>
                <p className="text-xs text-muted">
                  Modelo: {dash.ai.model}. Os limites ficam no arquivo <code>job-analyzer-backend/.env</code>.
                </p>
              </>
            )
          )}
        </div>
      </Card>

      <Card>
        <CardHeader title="Conta" icon={<KeyRound className="size-4.5" />} />
        <div className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div className="text-sm">
            <p className="font-medium">{user?.name}</p>
            <p className="text-muted">{user?.email}</p>
          </div>
          <Button variant="secondary" onClick={logout} icon={<LogOut className="size-4" />}>
            Sair
          </Button>
        </div>
      </Card>

      <SaveBar visible={dirty} saving={saving} onSave={() => save("Configurações salvas")} onReset={reset} />
    </div>
  );
}
