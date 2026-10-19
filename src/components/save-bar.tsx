"use client";

import { createPortal } from "react-dom";
import { Button } from "./ui/button";

/** Barra fixa que aparece quando há alterações não salvas. */
export function SaveBar({
  visible,
  saving,
  onSave,
  onReset,
}: {
  visible: boolean;
  saving: boolean;
  onSave: () => void;
  onReset: () => void;
}) {
  // Portal: a animação de entrada da página quebraria o "position: fixed".
  if (!visible || typeof document === "undefined") return null;
  return createPortal(
    <div className="animate-fade-up fixed inset-x-0 bottom-0 z-30 p-4 lg:left-64">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-3 pl-5 shadow-pop">
        <p className="text-sm font-medium">Você tem alterações não salvas</p>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onReset}>
            Descartar
          </Button>
          <Button size="sm" onClick={onSave} loading={saving}>
            Salvar alterações
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
