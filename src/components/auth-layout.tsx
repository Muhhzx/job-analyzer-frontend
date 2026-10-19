import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Logo } from "./logo";

const POINTS = [
  "Nota de compatibilidade para cada vaga",
  "Pontos fortes, lacunas e dicas de candidatura",
  "Aviso só quando aparece vaga boa",
];

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative hidden overflow-hidden border-r border-border bg-surface p-12 lg:flex lg:flex-col">
        <div className="absolute -top-32 -right-32 size-[28rem] rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-24 size-96 rounded-full bg-primary/10 blur-3xl" />
        <Link href="/" className="relative">
          <Logo />
        </Link>
        <div className="relative mt-auto max-w-md">
          <h2 className="text-3xl font-semibold tracking-tight">Encontre a vaga certa sem perder horas procurando.</h2>
          <ul className="mt-8 flex flex-col gap-3">
            {POINTS.map((p) => (
              <li key={p} className="flex items-center gap-3 text-muted">
                <CheckCircle2 className="size-5 shrink-0 text-primary" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex flex-col p-6 sm:p-12">
        <Link href="/" className="lg:hidden">
          <Logo />
        </Link>
        <div className="m-auto w-full max-w-sm py-12">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1.5 text-sm text-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
