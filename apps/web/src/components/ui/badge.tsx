import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-black/10 bg-white/70 px-2 py-1 text-xs font-medium text-[#5f564f]",
        className
      )}
      {...props}
    />
  );
}
