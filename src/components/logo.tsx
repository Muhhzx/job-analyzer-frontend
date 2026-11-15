import { Radar } from "lucide-react";
import { cn } from "@/lib/format";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 font-[family-name:var(--font-jakarta)] text-[15px] font-bold tracking-tight", className)}>
      <span className="bg-gold shadow-glow flex size-9 items-center justify-center rounded-xl text-on-primary ring-1 ring-inset ring-white/30">
        <Radar className="size-[18px]" />
      </span>
      <span>
        Job <span className="text-gold">Analyzer</span>
      </span>
    </span>
  );
}
