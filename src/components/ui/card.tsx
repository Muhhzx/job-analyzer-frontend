import { cn } from "@/lib/format";

export function Card({
  className,
  children,
  interactive,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return (
    <div
      className={cn(
        "surface-card rounded-2xl",
        interactive && "transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-pop",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

/** Quadradinho dourado com ícone, usado nos cabeçalhos de cards e nos indicadores. */
export function IconTile({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-primary/25 to-primary/5 text-primary ring-1 ring-inset ring-primary/25 [&_svg]:size-[18px]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
      <div className="flex items-start gap-3">
        {icon && <IconTile>{icon}</IconTile>}
        <div>
          <h2 className="text-[15px] font-semibold">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
