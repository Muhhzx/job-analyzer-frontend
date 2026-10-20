import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/format";

/**
 * Lista de páginas a mostrar, com "…" quando há muitas.
 * Ex.: página 6 de 12 → [1, "…", 5, 6, 7, "…", 12]
 */
function pageList(page: number, totalPages: number): (number | "…")[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);
  if (start > 2) pages.push("…");
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < totalPages - 1) pages.push("…");
  pages.push(totalPages);
  return pages;
}

export function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const btn = "flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm transition";

  return (
    <nav className="flex flex-col items-center justify-between gap-3 sm:flex-row" aria-label="Paginação">
      <p className="text-sm text-muted">
        Mostrando <b className="text-text">{from}–{to}</b> de <b className="text-text">{total}</b> vagas
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className={cn(btn, "text-muted hover:bg-surface-2 hover:text-text disabled:pointer-events-none disabled:opacity-40")}
          aria-label="Página anterior"
        >
          <ChevronLeft className="size-4" />
        </button>
        {pageList(page, totalPages).map((p, i) =>
          p === "…" ? (
            <span key={`gap-${i}`} className="px-1 text-muted">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              aria-current={p === page ? "page" : undefined}
              className={cn(
                btn,
                p === page ? "bg-primary font-semibold text-on-primary" : "text-muted hover:bg-surface-2 hover:text-text",
              )}
            >
              {p}
            </button>
          ),
        )}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          className={cn(btn, "text-muted hover:bg-surface-2 hover:text-text disabled:pointer-events-none disabled:opacity-40")}
          aria-label="Próxima página"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </nav>
  );
}
