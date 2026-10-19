"use client";

import { Briefcase, CircleHelp, LayoutDashboard, LogOut, Menu, Plus, Settings, UserRound, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn, initials } from "@/lib/format";
import { AddJobDialog } from "./add-job-dialog";
import { useAuth } from "./auth-provider";
import { Logo } from "./logo";
import { NotificationsMenu } from "./notifications-menu";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/controls";

const NAV = [
  { href: "/painel", label: "Início", icon: LayoutDashboard },
  { href: "/vagas", label: "Vagas", icon: Briefcase },
  { href: "/perfil", label: "Meu perfil", icon: UserRound },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
  { href: "/como-funciona", label: "Como funciona", icon: CircleHelp },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
              active ? "bg-primary-soft text-primary" : "text-muted hover:bg-surface-2 hover:text-text",
            )}
          >
            <Icon className="size-[18px]" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function UserBox() {
  const { user, logout } = useAuth();
  if (!user) return <Skeleton className="h-12" />;
  return (
    <div className="flex items-center gap-3 rounded-xl p-2">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary">
        {initials(user.name)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{user.name}</p>
        <p className="truncate text-xs text-muted">{user.email}</p>
      </div>
      <button onClick={logout} className="rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-text" aria-label="Sair" title="Sair">
        <LogOut className="size-4" />
      </button>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="min-h-dvh lg:pl-64">
      {/* Menu lateral (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-surface p-4 lg:flex">
        <Link href="/painel" className="mb-8 px-2 pt-1">
          <Logo />
        </Link>
        <NavLinks />
        <div className="mt-auto border-t border-border pt-3">
          <UserBox />
        </div>
      </aside>

      {/* Menu deslizante (celular) */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
          <aside className="animate-fade-up absolute inset-y-0 left-0 flex w-72 flex-col bg-surface p-4">
            <div className="mb-8 flex items-center justify-between px-2 pt-1">
              <Logo />
              <button onClick={() => setMenuOpen(false)} className="rounded-lg p-1.5 text-muted" aria-label="Fechar menu">
                <X className="size-5" />
              </button>
            </div>
            <NavLinks onNavigate={() => setMenuOpen(false)} />
            <div className="mt-auto border-t border-border pt-3">
              <UserBox />
            </div>
          </aside>
        </div>
      )}

      <header className="sticky top-0 z-20 border-b border-border bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <button
            onClick={() => setMenuOpen(true)}
            className="-ml-1 rounded-lg p-2 text-muted hover:bg-surface-2 lg:hidden"
            aria-label="Abrir menu"
          >
            <Menu className="size-5" />
          </button>
          <Link href="/painel" className="lg:hidden">
            <Logo className="[&>span:last-child]:hidden sm:[&>span:last-child]:inline" />
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="soft" icon={<Plus className="size-4" />} onClick={() => setAddOpen(true)} className="h-9">
              <span className="hidden sm:inline">Analisar vaga</span>
              <span className="sm:hidden">Vaga</span>
            </Button>
            <NotificationsMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      <AddJobDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
