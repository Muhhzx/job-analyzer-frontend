"use client";

import { ClipboardPaste } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import type { Job } from "@/lib/types";
import { Button } from "./ui/button";
import { Field, Input, Textarea } from "./ui/field";
import { Modal } from "./ui/modal";
import { useToast } from "./ui/toast";

const EMPTY = { title: "", company: "", location: "", url: "", description: "" };

/** Colar uma vaga de qualquer lugar (LinkedIn, Gupy, site da empresa) e analisar na hora. */
export function AddJobDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await api<{ job: Job }>("/jobs", { method: "POST", body: form });
      toast.success("Vaga adicionada", r.job.preview ? `Prévia grátis: ${r.job.preview.score}` : undefined);
      setForm(EMPTY);
      onClose();
      router.push(`/vagas/${r.job.id}`);
    } catch (err) {
      toast.error("Não foi possível salvar", (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Analisar uma vaga"
      description="Achou uma vaga no LinkedIn ou em outro site? Cole aqui e veja na hora se combina com você."
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field label="Título da vaga" htmlFor="job-title">
          <Input id="job-title" required value={form.title} onChange={set("title")} placeholder="Desenvolvedor Frontend Pleno" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Empresa" htmlFor="job-company">
            <Input id="job-company" value={form.company} onChange={set("company")} placeholder="Nome da empresa" />
          </Field>
          <Field label="Local / modelo" htmlFor="job-location">
            <Input id="job-location" value={form.location} onChange={set("location")} placeholder="Remoto, São Paulo..." />
          </Field>
        </div>
        <Field label="Link da vaga" htmlFor="job-url" hint="Opcional, para você voltar nela depois.">
          <Input id="job-url" type="url" value={form.url} onChange={set("url")} placeholder="https://..." />
        </Field>
        <Field label="Descrição completa" htmlFor="job-desc" hint="Copie todo o texto da vaga: requisitos, benefícios etc.">
          <Textarea id="job-desc" required minLength={50} rows={7} value={form.description} onChange={set("description")} />
        </Field>
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={saving} icon={<ClipboardPaste className="size-4" />}>
            {saving ? "Analisando..." : "Analisar vaga"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
