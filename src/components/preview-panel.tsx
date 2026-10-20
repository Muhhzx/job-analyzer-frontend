import { AlertTriangle, Check, GraduationCap, Target, X } from "lucide-react";
import { cn } from "@/lib/format";
import type { Preview } from "@/lib/types";
import { Card } from "./ui/card";
import { ScoreRing } from "./ui/score-ring";

function Chip({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium",
        ok ? "bg-success-soft text-success" : "bg-surface-2 text-muted line-through decoration-muted/50",
      )}
    >
      {ok ? <Check className="size-3" /> : <X className="size-3" />}
      {children}
    </span>
  );
}

/** Painel da prévia grátis: a nota e exatamente o que deu (ou não deu) match. */
export function PreviewPanel({ preview, cutoff }: { preview: Preview; cutoff: number }) {
  const { seniority } = preview;
  const seniorityText =
    seniority.job === null
      ? "A vaga não indica o nível"
      : seniority.profile === null
        ? `Vaga ${seniority.job} · preencha sua senioridade no perfil`
        : seniority.gap === 0
          ? `Vaga ${seniority.job} · igual ao seu nível`
          : seniority.gap! > 0
            ? `Vaga ${seniority.job} · acima do seu nível (${seniority.profile})`
            : `Vaga ${seniority.job} · abaixo do seu nível (${seniority.profile})`;

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <ScoreRing score={preview.score} size={64} preview />
        <div className="min-w-0">
          <h2 className="font-semibold">Prévia grátis</h2>
          <p className="mt-0.5 text-sm text-muted">
            Nota calculada por palavras-chave, sem IA e sem custo. Mostra o que encontramos no texto da vaga.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        <div>
          <p className="mb-2 text-xs font-medium text-muted uppercase">
            Suas habilidades na vaga ({preview.matchedSkills.length} de{" "}
            {preview.matchedSkills.length + preview.missingSkills.length})
          </p>
          {preview.matchedSkills.length + preview.missingSkills.length === 0 ? (
            <p className="text-sm text-muted">Cadastre suas habilidades no perfil para ver os matches.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {preview.matchedSkills.map((s) => (
                <Chip key={s} ok>
                  {s}
                </Chip>
              ))}
              {preview.missingSkills.map((s) => (
                <Chip key={s} ok={false}>
                  {s}
                </Chip>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <div className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2.5">
            <Target className={cn("size-4 shrink-0", preview.roleMatched ? "text-success" : "text-muted")} />
            {preview.roleMatched ? (
              <span>
                Título bate com <b>{preview.roleMatched}</b>
              </span>
            ) : (
              <span className="text-muted">Título não bate com seus cargos</span>
            )}
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2.5">
            <GraduationCap
              className={cn(
                "size-4 shrink-0",
                seniority.penalty > 0 ? "text-warning" : seniority.gap === 0 ? "text-success" : "text-muted",
              )}
            />
            <span className={seniority.penalty > 0 ? "text-warning" : undefined}>
              {seniorityText}
              {seniority.penalty > 0 && ` (−${seniority.penalty})`}
              {seniority.evidence && (
                <span className="block text-xs text-muted">
                  pelo {seniority.source}: “{seniority.evidence}”
                </span>
              )}
            </span>
          </div>
        </div>

        {seniority.accepted === false && (
          <div className="flex items-start gap-2 rounded-xl border border-warning/30 bg-warning-soft px-3 py-2.5 text-sm text-warning">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <span>
              <b>Fora dos níveis que você quer ver.</b> Esta vaga não aparece na lista. Você chegou aqui por um link
              direto ou por uma notificação.
            </span>
          </div>
        )}

        {preview.dealBreakers.length > 0 && (
          <div className="flex items-start gap-2 rounded-xl bg-danger-soft px-3 py-2.5 text-sm text-danger">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <span>
              Menciona o que você não aceita: <b>{preview.dealBreakers.join(", ")}</b> (−{preview.dealBreakers.length * 25})
            </span>
          </div>
        )}

        {preview.belowCutoff && (
          <div className="flex items-start gap-2 rounded-xl border border-warning/30 bg-warning-soft px-3 py-2.5 text-sm text-warning">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <span>
              <b>Pouco compatível pelo pré-filtro</b> (nota abaixo de {cutoff}). Ela fica disponível, mas nunca é
              analisada automaticamente.
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
