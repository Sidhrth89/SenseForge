import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/logo";

export function SimplePage({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#f7f1eb] text-[#17120f]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Logo />
        <ButtonLink href="/dashboard" variant="outline" size="sm">
          Dashboard
        </ButtonLink>
      </header>
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <h1 className="text-5xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-[#625952]">{description}</p>
        <div className="mt-10">{children}</div>
      </section>
    </main>
  );
}
