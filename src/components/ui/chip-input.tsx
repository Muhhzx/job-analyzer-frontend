"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { cn, splitList } from "@/lib/format";

/**
 * Campo de etiquetas: digite e aperte Enter (ou vírgula) para adicionar.
 * O valor é salvo como texto separado por vírgula, que é o formato da API.
 */
export function ChipInput({
  id,
  value,
  onChange,
  placeholder,
  suggestions = [],
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suggestions?: string[];
}) {
  const chips = splitList(value);
  const [draft, setDraft] = useState("");

  const commit = (items: string[]) => onChange(items.join(", "));
  const add = (raw: string) => {
    const items = splitList(raw).filter((s) => !chips.some((c) => c.toLowerCase() === s.toLowerCase()));
    if (items.length) commit([...chips, ...items]);
    setDraft("");
  };
  const remove = (i: number) => commit(chips.filter((_, k) => k !== i));
  const unused = suggestions.filter((s) => !chips.some((c) => c.toLowerCase() === s.toLowerCase())).slice(0, 8);

  return (
    <div className="flex flex-col gap-2">
      <div
        className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-xl border border-border bg-surface px-2 py-1.5 transition focus-within:border-primary focus-within:ring-4 focus-within:ring-[var(--ring)]"
        onClick={() => document.getElementById(id ?? "")?.focus()}
      >
        {chips.map((chip, i) => (
          <span
            key={`${chip}-${i}`}
            className="inline-flex items-center gap-1 rounded-lg bg-primary-soft py-1 pr-1 pl-2.5 text-xs font-medium text-primary"
          >
            {chip}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                remove(i);
              }}
              className="rounded p-0.5 hover:bg-primary/15"
              aria-label={`Remover ${chip}`}
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          onChange={(e) => {
            const v = e.target.value;
            if (/[,;]$/.test(v)) add(v);
            else setDraft(v);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(draft);
            } else if (e.key === "Backspace" && !draft && chips.length) {
              remove(chips.length - 1);
            }
          }}
          onBlur={() => draft && add(draft)}
          placeholder={chips.length ? "" : placeholder}
          className="min-w-32 flex-1 bg-transparent px-1.5 py-1 text-sm outline-none placeholder:text-muted/70"
        />
      </div>
      {unused.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {unused.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className={cn(
                "rounded-lg border border-dashed border-border px-2 py-0.5 text-xs text-muted transition hover:border-primary hover:text-primary",
              )}
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
