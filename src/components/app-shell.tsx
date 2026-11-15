"use client";

import { Briefcase, CircleHelp, KanbanSquare, LayoutDashboard, LogOut, Menu, Plus, Settings, UserRound, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn, initials } from "@/lib/format";
import { AddJobDialog } from "./add-job-dialog";
import { useAuth } from "./auth-provider";
import { Logo } from "./logo";
import { NotificationsMenu } from "./notifications-menu";
import { Button, IconButton } from "./ui/button";
import { Skeleton } from "./ui/controls";

const NAV = [
  { href: "/painel", label: "Início", icon: LayoutDashboard },
  { href: "/vagas", label: "Vagas", icon: Briefcase },
  { href: "/candidaturas", label: "Candidaturas", icon: KanbanSquare },
  { href: "/perfil", label: "Meu perfil", icon: UserRound },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

const HELP = [{ href: "/como-funciona", label: "Como funciona", icon: CircleHelp }];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

function NavGroup({
  title,
  items,
  onNavigate,
}: {
  title: string;
  items: typeof NAV;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <div>
      <p className="mb-2 px-3 text-[10px] font-semibold tracking-[0.14em] text-muted/70 uppercase">{title}</p>
      <nav className="flex flex-col gap-0.5">
        {items.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-gradient-to-r from-primary/15 to-primary/[0.02] text-text"
                  : "text-muted hover:bg-white/[0.04] hover:text-text",
              )}
            >
              {/* Barra dourada à esquerda do item ativo */}
              <span
                className={cn(
                  "absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-gold transition-opacity",
                  active ? "opacity-100" : "opacity-0",
                )}
              />
              <Icon className={cn("size-[18px] transition", active ? "text-primary" : "group-hover:text-text")} />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function UserBox() {
  const { user, logout } = useAuth();
  if (!user) return <Skeleton className="h-14" />;
  return (
    <div className="surface-card flex items-center gap-3 rounded-2xl p-2.5">
      <div className="bg-gold flex size-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-on-primary">
        {initials(user.name)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{user.name}</p>
        <p className="truncate text-xs text-muted">{user.email}</p>
      </div>
      <IconButton label="Sair" onClick={logout} className="size-8 [&_svg]:size-4">
        <LogOut />
      </IconButton>
    </div>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <div className="flex flex-col gap-6">
        <NavGroup title="Menu" items={NAV} onNavigate={onNavigate} />
        <NavGroup title="Ajuda" items={HELP} onNavigate={onNavigate} />
      </div>
      <div className="mt-auto pt-4">
        <UserBox />
      </div>
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const current = [...NAV, ...HELP].find((n) => isActive(pathname, n.href));

  return (
    <div className="min-h-dvh lg:pl-[264px]">
      {/* Menu lateral (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] flex-col border-r border-border bg-gradient-to-b from-surface to-bg p-4 lg:flex">
        <Link href="/painel" className="mb-8 px-2 pt-1">
          <Logo />
        </Link>
        <SidebarContent />
      </aside>

      {/* Menu deslizante (celular) */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <aside className="animate-fade-up absolute inset-y-0 left-0 flex w-72 flex-col border-r border-border bg-surface p-4">
            <div className="mb-8 flex items-center justify-between px-2 pt-1">
              <Logo />
              <IconButton label="Fechar menu" onClick={() => setMenuOpen(false)}>
                <X />
              </IconButton>
            </div>
            <SidebarContent onNavigate={() => setMenuOpen(false)} />
          </aside>
        </div>
      )}

      <header className="glass sticky top-0 z-20 border-b border-border">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <IconButton label="Abrir menu" onClick={() => setMenuOpen(true)} className="-ml-2 lg:hidden">
            <Menu />
          </IconButton>
          <Link href="/painel" className="lg:hidden">
            <Logo className="[&>span:last-child]:hidden sm:[&>span:last-child]:inline" />
          </Link>
          {current && (
            <p className="hidden items-center gap-2 text-sm text-muted lg:flex">
              <current.icon className="size-4" />
              {current.label}
            </p>
          )}
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" icon={<Plus className="size-4" />} onClick={() => setAddOpen(true)} className="h-9 px-3.5">
              <span className="hidden sm:inline">Analisar vaga</span>
              <span className="sm:hidden">Vaga</span>
            </Button>
            <NotificationsMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">{children}</main>
      <AddJobDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
