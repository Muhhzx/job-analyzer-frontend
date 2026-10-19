"use client";

import { Bell, BellOff } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { cn, timeAgo } from "@/lib/format";
import type { Notification } from "@/lib/types";

export function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const load = () =>
    api<{ notifications: Notification[]; unread: number }>("/notifications")
      .then((r) => {
        setItems(r.notifications);
        setUnread(r.unread);
      })
      .catch(() => {});

  useEffect(() => {
    void load();
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      await load();
      if (unread > 0) {
        await api("/notifications/read", { method: "POST" });
        setUnread(0);
      }
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggle}
        className="relative flex size-10 items-center justify-center rounded-xl text-muted transition hover:bg-surface-2 hover:text-text"
        aria-label="Notificações"
      >
        <Bell className="size-5" />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 flex min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="animate-fade-up absolute right-0 z-40 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-surface shadow-pop">
          <div className="border-b border-border px-4 py-3 text-sm font-semibold">Notificações</div>
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center text-sm text-muted">
              <BellOff className="size-6" />
              Nada por aqui ainda. Avisamos quando aparecer uma vaga que combina com você.
            </div>
          ) : (
            <ul className="max-h-96 overflow-y-auto">
              {items.map((n) => {
                const content = (
                  <div className={cn("flex gap-3 px-4 py-3 transition hover:bg-surface-2", !n.read && "bg-primary-soft/50")}>
                    <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.read ? "bg-transparent" : "bg-primary")} />
                    <div className="min-w-0">
                      <p className="text-sm">{n.message}</p>
                      <p className="mt-0.5 text-xs text-muted">{timeAgo(n.created_at)}</p>
                    </div>
                  </div>
                );
                return (
                  <li key={n.id} className="border-b border-border last:border-0">
                    {n.job_id ? (
                      <Link href={`/vagas/${n.job_id}`} onClick={() => setOpen(false)}>
                        {content}
                      </Link>
                    ) : (
                      content
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
