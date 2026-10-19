import { Radar } from "lucide-react";
import { cn } from "@/lib/format";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
      <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-on-primary shadow-card">
        <Radar className="size-4.5" />
      </span>
      <span>Job Analyzer</span>
    </span>
  );
}
