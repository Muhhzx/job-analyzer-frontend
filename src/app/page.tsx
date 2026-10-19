import { ArrowRight, BellRing, Brain, Radar, SlidersHorizontal } from "lucide-react";
import { Logo } from "@/components/logo";
import { ButtonLink } from "@/components/ui/button";

const FEATURES = [
  {
    icon: Radar,
    title: "Busca vagas por você",
    text: "Remotive, sites de carreira de empresas e qualquer vaga que você colar, inclusive do LinkedIn.",
  },
  {
    icon: Brain,
    title: "Analisa com IA",
    text: "Cada vaga ganha uma nota de 0 a 100 com o que combina, o que falta e dicas para se candidatar.",
  },
  {
    icon: BellRing,
    title: "Só avisa o que importa",
    text: "Você define a nota mínima e recebe aviso apenas das vagas que valem a pena.",
  },
  {
    icon: SlidersHorizontal,
    title: "Você no controle",
    text: "Tudo manual ou automático no horário que você escolher, com limite de gasto mensal.",
  },
];

export default function Home() {
  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <div className="flex items-center gap-2">
          <ButtonLink href="/login" variant="ghost" size="sm">
            Entrar
          </ButtonLink>
          <ButtonLink href="/cadastro" size="sm">
            Criar conta
          </ButtonLink>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 -top-40 mx-auto h-96 max-w-3xl rounded-full bg-primary/20 blur-3xl" />
        <div className="relative mx-auto max-w-3xl px-4 pt-16 pb-20 text-center sm:pt-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted shadow-card">
            <span className="size-1.5 rounded-full bg-success" /> Sua central de vagas com IA
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
            Pare de garimpar vagas.
            <span className="block text-primary">Receba só as que combinam com você.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-pretty text-muted">
            O Job Analyzer junta vagas de vários lugares, compara cada uma com o seu perfil e te mostra onde vale a pena
            se candidatar, e por quê.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/cadastro" size="lg" icon={<ArrowRight className="size-4" />} className="flex-row-reverse">
              Começar grátis
            </ButtonLink>
            <ButtonLink href="/login" size="lg" variant="secondary">
              Já tenho conta
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-24 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {FEATURES.map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-2xl border border-border bg-surface p-5 shadow-card">
            <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <Icon className="size-5" />
            </div>
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-1.5 text-sm text-muted">{text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
