import Link from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/format";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "soft";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  // Dourado em gradiente, com brilho embaixo e um reflexo no topo (inset).
  primary:
    "bg-gold text-on-primary font-semibold shadow-glow ring-1 ring-inset ring-white/25 hover:brightness-110 hover:-translate-y-px hover:shadow-[0_14px_34px_-10px_rgba(212,175,55,0.7)]",
  // Vidro: fundo translúcido e borda clara.
  secondary:
    "bg-white/[0.04] text-text ring-1 ring-inset ring-white/10 hover:bg-white/[0.08] hover:ring-white/20",
  ghost: "text-muted hover:bg-white/[0.05] hover:text-text",
  danger: "bg-danger-soft text-danger ring-1 ring-inset ring-danger/25 hover:bg-danger/20",
  soft: "bg-primary-soft text-primary ring-1 ring-inset ring-primary/25 hover:bg-primary/20",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-xl",
  lg: "h-12 px-6 text-[15px] gap-2 rounded-xl",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(
    "inline-flex items-center justify-center font-medium whitespace-nowrap transition-all duration-200 active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45 [&_svg]:shrink-0",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
};

export function Button({ variant, size, loading, icon, className, children, disabled, ...rest }: Props) {
  return (
    <button className={buttonClass(variant, size, className)} disabled={disabled || loading} {...rest}>
      {loading ? <Loader2 className="size-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}

/** Botão só com ícone (ex.: excluir, fechar). Sempre com `label` para leitores de tela. */
export function IconButton({
  label,
  className,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-xl text-muted transition hover:bg-white/[0.06] hover:text-text [&_svg]:size-[18px]",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant,
  size,
  icon,
  className,
  children,
  external,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  icon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={buttonClass(variant, size, className)}>
        {icon}
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={buttonClass(variant, size, className)}>
      {icon}
      {children}
    </Link>
  );
}
