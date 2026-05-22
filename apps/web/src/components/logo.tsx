import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 text-[#111111]", className)}>
      <div className="flex size-9 items-center justify-center rounded-lg bg-[#111111] text-[var(--sf-orange)]">
        <Flame aria-hidden="true" />
      </div>
      {!compact ? <span className="text-lg font-semibold tracking-tight">SenseForge</span> : null}
    </div>
  );
}
