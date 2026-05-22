import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg" | "icon";

const variants: Record<Variant, string> = {
  primary: "bg-[var(--sf-orange)] text-white shadow-[0_18px_40px_rgba(255,106,0,0.24)] hover:bg-[#e85f00]",
  secondary: "bg-[#151515] text-white hover:bg-[#252525]",
  ghost: "text-[#3b332d] hover:bg-black/5",
  outline: "border border-black/10 bg-white/70 text-[#17120f] hover:bg-white"
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
  icon: "size-10 p-0"
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sf-orange)] disabled:pointer-events-none disabled:opacity-50";

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}

export function ButtonLink({
  className,
  variant = "primary",
  size = "md",
  href,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: Variant;
  size?: Size;
  href: string;
  children: ReactNode;
}) {
  const composed = cn(base, variants[variant], sizes[size], className);
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={composed}>
        {children}
      </Link>
    );
  }

  return (
    <a className={composed} href={href} {...props}>
      {children}
    </a>
  );
}
