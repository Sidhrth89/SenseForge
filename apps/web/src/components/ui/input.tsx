import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 rounded-lg border border-black/10 bg-white px-3 text-sm text-[#17120f] outline-none transition placeholder:text-[#9d9288] focus:border-[var(--sf-orange)] focus:ring-2 focus:ring-[rgba(255,106,0,0.16)]",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-36 resize-none rounded-lg border border-black/10 bg-white p-4 text-sm leading-6 text-[#17120f] outline-none transition placeholder:text-[#9d9288] focus:border-[var(--sf-orange)] focus:ring-2 focus:ring-[rgba(255,106,0,0.16)]",
        className
      )}
      {...props}
    />
  );
}
