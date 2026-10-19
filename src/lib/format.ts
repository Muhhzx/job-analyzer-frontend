import type { JobStatus, Verdict } from "./types";

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export type Tone = "success" | "primary" | "warning" | "danger" | "neutral";

export function scoreTone(score: number | null | undefined): Tone {
  if (score === null || score === undefined) return "neutral";
  if (score >= 85) return "success";
  if (score >= 70) return "primary";
  if (score >= 45) return "warning";
  return "danger";
}

export const VERDICT_LABEL: Record<Verdict, string> = {
  excelente: "Combina muito",
  boa: "Boa combinação",
  parcial: "Combina em parte",
  fraca: "Combina pouco",
};

export const STATUS_LABEL: Record<JobStatus, string> = {
  nova: "Nova",
  salva: "Salva",
  candidatado: "Candidatei",
  descartada: "Descartada",
};

export const SOURCE_LABEL: Record<string, string> = {
  remotive: "Remotive",
  greenhouse: "Greenhouse",
  lever: "Lever",
  manual: "Adicionada por você",
};

/** "há 5 min", "há 2 h", "há 3 dias". Datas do SQLite vêm em UTC sem fuso. */
export function timeAgo(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(/[zZ]|[+-]\d\d:\d\d$/.test(value) ? value : value.replace(" ", "T") + "Z");
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return "agora";
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `há ${Math.floor(diff / 3600)} h`;
  const days = Math.floor(diff / 86400);
  return days === 1 ? "ontem" : `há ${days} dias`;
}

export function formatDateTime(value: string): string {
  const date = new Date(/[zZ]$/.test(value) ? value : value.replace(" ", "T") + "Z");
  return date.toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function frequencyLabel(hours: number): string {
  if (hours === 0) return "Manual";
  if (hours === 168) return "1x por semana";
  if (hours === 24) return "1x por dia";
  return `A cada ${hours} horas`;
}

export function splitList(value: string): string[] {
  return value
    .split(/[,\n;]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function initials(text: string): string {
  return (
    text
      .split(/[\s-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]!.toUpperCase())
      .join("") || "?"
  );
}
