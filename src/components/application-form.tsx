"use client";

import { Save } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { formatDateTime, STAGE_INFO } from "@/lib/format";
import type { Application, ApplicationEvent, Stage } from "@/lib/types";

const STAGES = Object.keys(STAGE_INFO) as Stage[];

export type SavedApplication = { application: Application; events: ApplicationEvent[] };

/**
 * Formulário da candidatura: etapa, data, CV usado, pretensão, contato e anotações.
 * Usado no quadro (dentro do modal) e na tela da vaga.
 */
export function ApplicationForm({
  jobId,
  application,
  events,
  resumes = [],
  onSaved,
}: {
  jobId: number;
  application: Application;
  events?: ApplicationEvent[];
  resumes?: string[];
  onSaved: (saved: SavedApplication) => void;
}) {
  const toast = useToast();
  const [form, setForm] = useState({
    stage: application.stage,
    applied_at: application.applied_at ?? "",
    resume_used: application.resume_used,
    salary_expectation: application.salary_expectation,
    contact: application.contact,
    notes: application.notes,
  });
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((f) => ({ ...f, [key]: value }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const saved = await api<SavedApplication>(`/applications/${jobId}`, {
        method: "PATCH",
        body: { ...form, applied_at: form.applied_at || null },
      });
      onSaved(saved);
      toast.success("Candidatura salva");
    } catch (err) {
      toast.error("Não foi possível salvar", (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const listId = `resumes-${jobId}`;
  return (
    <form onSubmit={save} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Etapa" htmlFor={`stage-${jobId}`}>
          <Select id={`stage-${jobId}`} value={form.stage} onChange={(e) => set("stage", e.target.value as Stage)}>
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {STAGE_INFO[s].label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Data da candidatura" htmlFor={`applied-${jobId}`}>
          <Input
            id={`applied-${jobId}`}
            type="date"
            value={form.applied_at}
            onChange={(e) => set("applied_at", e.target.value)}
          />
        </Field>
        <Field label="CV usado" htmlFor={`resume-${jobId}`} hint="Ex.: CV Angular PT-BR">
          <Input
            id={`resume-${jobId}`}
            list={listId}
            value={form.resume_used}
            onChange={(e) => set("resume_used", e.target.value)}
            maxLength={200}
          />
          <datalist id={listId}>
            {resumes.map((r) => (
              <option key={r} value={r} />
            ))}
          </datalist>
        </Field>
        <Field label="Pretensão informada" htmlFor={`salary-${jobId}`} hint="Ex.: R$ 6.000 CLT">
          <Input
            id={`salary-${jobId}`}
            value={form.salary_expectation}
            onChange={(e) => set("salary_expectation", e.target.value)}
            maxLength={100}
          />
        </Field>
      </div>
      <Field label="Contato" htmlFor={`contact-${jobId}`} hint="Recrutador ou quem indicou, com link do LinkedIn">
        <Input
          id={`contact-${jobId}`}
          value={form.contact}
          onChange={(e) => set("contact", e.target.value)}
          maxLength={500}
        />
      </Field>
      <Field label="Anotações" htmlFor={`notes-${jobId}`}>
        <Textarea
          id={`notes-${jobId}`}
          rows={4}
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          maxLength={5000}
          placeholder="Etapas, perguntas da entrevista, prazos, impressões…"
        />
      </Field>

      {events && events.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium">Histórico</p>
          <ol className="flex flex-col gap-1.5 border-l border-border pl-4">
            {events.map((ev, i) => (
              <li key={i} className="relative text-sm">
                <span className="absolute top-1.5 -left-[21px] size-2 rounded-full bg-gold" />
                <span className="font-medium">{STAGE_INFO[ev.stage].label}</span>
                <span className="text-muted"> · {formatDateTime(ev.created_at)}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" loading={saving} icon={<Save className="size-4" />}>
          Salvar
        </Button>
      </div>
    </form>
  );
}
