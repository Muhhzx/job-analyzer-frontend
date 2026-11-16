"use client";

import { Ban, Check, FileText, PartyPopper, Target, UserRound } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { SaveBar } from "@/components/save-bar";
import { useProfileForm } from "@/components/use-profile-form";
import { Card, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { ChipInput } from "@/components/ui/chip-input";
import { ProgressBar, Segmented, Skeleton } from "@/components/ui/controls";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { cn, splitList } from "@/lib/format";
import type { BlockPreset, Profile } from "@/lib/types";

/**
 * Filtros de bloqueio: escondem a vaga (diferente do "não aceito", que só tira pontos).
 * Bloqueios prontos (com os termos que cada um procura), termos próprios e limite de anos.
 */
function BlockFilters({
  form,
  presets,
  set,
}: {
  form: Profile;
  presets: BlockPreset[];
  set: <K extends keyof Profile>(key: K, value: Profile[K]) => void;
}) {
  const active = splitList(form.block_presets);
  const toggle = (id: string) =>
    set("block_presets", (active.includes(id) ? active.filter((x) => x !== id) : [...active, id]).join(","));

  return (
    <div className="flex flex-col gap-5 p-5">
      <div className="flex flex-col gap-2">
        {presets.map((p) => {
          const on = active.includes(p.id);
          return (
            <label
              key={p.id}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-3 transition",
                on ? "border-primary/60 bg-primary/[0.06]" : "border-white/10 bg-white/[0.03] hover:border-white/20",
              )}
            >
              <input
                type="checkbox"
                checked={on}
                onChange={() => toggle(p.id)}
                className="mt-0.5 size-4 accent-[var(--primary)]"
              />
              <span className="min-w-0">
                <span className="block text-sm font-medium">{p.label}</span>
                <span className="block text-xs text-muted">Procura: {p.terms.slice(0, 6).join(", ")}…</span>
              </span>
            </label>
          );
        })}
      </div>

      <Field
        label="Esconder vagas que pedem muitos anos de experiência"
        htmlFor="block_max_years"
        hint="Vale quando a descrição cita os anos (ex.: “3+ anos de experiência”, “5 years of experience”)."
      >
        <Select
          id="block_max_years"
          value={form.block_max_years}
          onChange={(e) => set("block_max_years", Number(e.target.value))}
        >
          <option value={0}>Não esconder</option>
          {[2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              Esconder se pedir {n} anos ou mais
            </option>
          ))}
        </Select>
      </Field>

      <Field
        label="Outros termos que escondem a vaga"
        htmlFor="block_terms"
        hint="Digite e aperte Enter. Ex.: uma cidade onde não pode morar, “PJ”, uma tecnologia que você não aceita de jeito nenhum."
      >
        <ChipInput
          id="block_terms"
          value={form.block_terms}
          onChange={(v) => set("block_terms", v)}
          placeholder="Ex.: Curitiba, PHP..."
        />
      </Field>
    </div>
  );
}

const SKILL_SUGGESTIONS = ["JavaScript", "TypeScript", "React", "Node.js", "Python", "SQL", "Docker", "AWS", "Git", "Inglês"];
const SENIORITY = ["Estágio", "Júnior", "Pleno", "Sênior", "Especialista", "Liderança"];

/** Níveis de vaga, na mesma ordem (0 a 4) do backend (seniority.ts). */
const JOB_LEVELS = ["Estágio", "Júnior", "Pleno", "Sênior", "Especialista / Lead"];
const PROFILE_LEVEL: Record<string, number> = {
  Estágio: 0,
  Júnior: 1,
  Pleno: 2,
  Sênior: 3,
  Especialista: 4,
  Liderança: 4,
};

/**
 * Escolha dos níveis de vaga que aparecem na lista.
 * Sem escolha, o backend usa o automático: o nível do perfil e um acima.
 */
function LevelPicker({
  seniority,
  value,
  onChange,
}: {
  seniority: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const chosen = value
    .split(",")
    .filter((s) => s.trim() !== "")
    .map(Number);
  const own = PROFILE_LEVEL[seniority];
  const automatic = own === undefined ? [] : [own, Math.min(own + 1, 4)].filter((v, i, a) => a.indexOf(v) === i);
  const isAuto = chosen.length === 0;
  const active = isAuto ? automatic : chosen;

  const toggle = (level: number) => {
    const next = active.includes(level) ? active.filter((l) => l !== level) : [...active, level];
    onChange(next.sort((a, b) => a - b).join(","));
  };

  return (
    <Field
      label="Níveis de vaga que quero ver"
      hint={
        own === undefined && isAuto
          ? "Escolha sua senioridade acima, ou marque os níveis aqui. Sem isso, aparecem vagas de todos os níveis."
          : isAuto
            ? "Automático: o seu nível e um acima. Clique para escolher outros. Vagas sem nível no título continuam aparecendo."
            : "Vagas de outros níveis ficam escondidas. Vagas sem nível no título continuam aparecendo."
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        {JOB_LEVELS.map((label, level) => {
          const on = active.includes(level);
          return (
            <button
              key={label}
              type="button"
              onClick={() => toggle(level)}
              aria-pressed={on}
              className={
                on
                  ? "inline-flex items-center gap-1.5 rounded-full border border-primary bg-primary-soft px-3.5 py-1.5 text-sm font-medium text-primary"
                  : "rounded-full border border-dashed border-border px-3.5 py-1.5 text-sm text-muted line-through decoration-muted/40 hover:text-text"
              }
            >
              {on && <Check className="size-3.5" />}
              {label}
            </button>
          );
        })}
        {!isAuto && (
          <button type="button" onClick={() => onChange("")} className="text-xs text-primary hover:underline">
            Voltar ao automático
          </button>
        )}
      </div>
    </Field>
  );
}

const SECTIONS = [
  { id: "sobre", label: "Sobre você" },
  { id: "objetivo", label: "O que você procura" },
  { id: "curriculo", label: "Currículo" },
];

function ProfileForm() {
  const params = useSearchParams();
  const { form, completion, blockPresets, loading, set, save, saving, dirty, reset } = useProfileForm();

  if (loading || !form) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="animate-fade-up flex flex-col gap-6 pb-24">
      <PageHeader
        eyebrow="Você"
        title="Meu perfil"
        description="A IA usa essas informações para dar nota às vagas. Quanto mais completo, melhor a análise."
      />

      {params.get("boas-vindas") && (
        <Card className="flex items-start gap-4 border-primary/30 bg-primary-soft/50 p-5">
          <PartyPopper className="mt-0.5 size-5 shrink-0 text-primary" />
          <div>
            <p className="font-semibold">Conta criada! Agora conte um pouco sobre você.</p>
            <p className="mt-1 text-sm text-muted">
              O mínimo para começar: suas <b>habilidades</b> e os <b>cargos</b> que você procura. O resto você completa
              quando quiser.
            </p>
          </div>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 flex flex-col gap-5">
            {completion && (
              <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-medium">Perfil completo</span>
                  <span className="font-semibold text-primary tabular-nums">{completion.percent}%</span>
                </div>
                <ProgressBar value={completion.percent} max={100} />
                {completion.missing.length > 0 && (
                  <p className="mt-3 text-xs text-muted">Falta: {completion.missing.join(", ")}</p>
                )}
              </div>
            )}
            <nav className="flex flex-col gap-1 text-sm">
              {SECTIONS.map((s) => (
                <a key={s.id} href={`#${s.id}`} className="rounded-lg px-3 py-2 text-muted hover:bg-surface-2 hover:text-text">
                  {s.label}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        <div className="flex flex-col gap-6">
          <Card id="sobre" className="scroll-mt-24">
            <CardHeader title="Sobre você" description="Quem você é profissionalmente." icon={<UserRound className="size-4.5" />} />
            <div className="flex flex-col gap-5 p-5">
              <Field label="Resumo profissional" htmlFor="headline" hint="Uma ou duas frases, como no topo do LinkedIn.">
                <Textarea
                  id="headline"
                  rows={2}
                  value={form.headline}
                  onChange={(e) => set("headline", e.target.value)}
                  placeholder="Dev full-stack com 4 anos em React e Node, focado em produtos SaaS"
                />
              </Field>
              <Field label="Senioridade">
                <div className="flex flex-wrap gap-2">
                  {SENIORITY.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => set("seniority", form.seniority === s ? "" : s)}
                      className={
                        form.seniority === s
                          ? "rounded-full border border-primary bg-primary-soft px-3.5 py-1.5 text-sm font-medium text-primary"
                          : "rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm text-muted hover:text-text"
                      }
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </Field>
              <LevelPicker
                seniority={form.seniority}
                value={form.accepted_levels}
                onChange={(v) => set("accepted_levels", v)}
              />
              <Field label="Habilidades" htmlFor="skills" hint="Digite e aperte Enter. Use os nomes como aparecem nas vagas.">
                <ChipInput
                  id="skills"
                  value={form.skills}
                  onChange={(v) => set("skills", v)}
                  placeholder="React, TypeScript, SQL..."
                  suggestions={SKILL_SUGGESTIONS}
                />
              </Field>
              <Field label="Experiência" htmlFor="experience" hint="Empresas, projetos e resultados que você entregou.">
                <Textarea id="experience" rows={4} value={form.experience} onChange={(e) => set("experience", e.target.value)} />
              </Field>
              <Field label="Idiomas" htmlFor="languages">
                <ChipInput
                  id="languages"
                  value={form.languages}
                  onChange={(v) => set("languages", v)}
                  placeholder="Português nativo, Inglês avançado"
                />
              </Field>
            </div>
          </Card>

          <Card id="objetivo" className="scroll-mt-24">
            <CardHeader
              title="O que você procura"
              description="Usado para descartar vagas que não servem, mesmo que a parte técnica combine."
              icon={<Target className="size-4.5" />}
            />
            <div className="flex flex-col gap-5 p-5">
              <Field label="Cargos desejados" htmlFor="desired_roles">
                <ChipInput
                  id="desired_roles"
                  value={form.desired_roles}
                  onChange={(v) => set("desired_roles", v)}
                  placeholder="Desenvolvedor Frontend, Full Stack..."
                />
              </Field>
              <Field label="Modelo de trabalho">
                <Segmented
                  value={form.work_mode}
                  onChange={(v) => set("work_mode", v)}
                  options={[
                    { value: "qualquer", label: "Tanto faz" },
                    { value: "remoto", label: "Remoto" },
                    { value: "híbrido", label: "Híbrido" },
                    { value: "presencial", label: "Presencial" },
                  ]}
                />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Onde aceita trabalhar" htmlFor="locations">
                  <ChipInput
                    id="locations"
                    value={form.locations}
                    onChange={(v) => set("locations", v)}
                    placeholder="São Paulo, Brasil, LATAM"
                  />
                </Field>
                <Field label="Pretensão salarial mínima" htmlFor="salary_min">
                  <Input
                    id="salary_min"
                    value={form.salary_min}
                    onChange={(e) => set("salary_min", e.target.value)}
                    placeholder="R$ 10.000 CLT"
                  />
                </Field>
              </div>
              <Field
                label="O que você não aceita"
                htmlFor="deal_breakers"
                hint="Vagas que mencionam isso perdem nota. Ex.: presencial, plantão, uma tecnologia que você evita."
              >
                <ChipInput
                  id="deal_breakers"
                  value={form.deal_breakers}
                  onChange={(v) => set("deal_breakers", v)}
                  placeholder="presencial, PHP..."
                />
              </Field>
            </div>
          </Card>

          <Card id="bloqueios" className="scroll-mt-24">
            <CardHeader
              title="Filtros de bloqueio"
              description="Escondem de vez as vagas impossíveis para você. Elas ficam em “Bloqueadas”, com o motivo, para você conferir."
              icon={<Ban className="size-4.5" />}
            />
            <BlockFilters form={form} presets={blockPresets} set={set} />
          </Card>

          <Card id="curriculo" className="scroll-mt-24">
            <CardHeader
              title="Currículo"
              description="Cole o texto do seu currículo. É a informação que mais melhora a análise."
              icon={<FileText className="size-4.5" />}
            />
            <div className="p-5">
              <Textarea
                id="resume_text"
                aria-label="Texto do currículo"
                rows={12}
                value={form.resume_text}
                onChange={(e) => set("resume_text", e.target.value)}
                placeholder="Abra seu currículo, selecione tudo (Ctrl+A), copie e cole aqui."
              />
              <p className="mt-2 text-xs text-muted">{form.resume_text.length.toLocaleString("pt-BR")} caracteres</p>
            </div>
          </Card>
        </div>
      </div>

      <SaveBar visible={dirty} saving={saving} onSave={() => save()} onReset={reset} />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense>
      <ProfileForm />
    </Suspense>
  );
}
