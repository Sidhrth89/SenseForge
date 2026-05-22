import { ArrowRight, Chrome, Command, Database, LockKeyhole, PanelRight, Workflow } from "lucide-react";
import { templates, type ForgeMode } from "@senseforge/shared";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { ModeIcon } from "@/components/mode-icon";

const modes: Array<{ mode: ForgeMode; title: string; body: string }> = [
  {
    mode: "think",
    title: "Think",
    body: "Strategic reasoning, research, opportunities, risks, and execution roadmaps."
  },
  {
    mode: "create",
    title: "Create",
    body: "Production-grade creative prompts for images, campaigns, videos, and brand systems."
  },
  {
    mode: "agents",
    title: "Agents",
    body: "Browser-aware workflows, multi-step chains, run history, retries, and continuation."
  },
  {
    mode: "build",
    title: "Build",
    body: "Architecture, frontend, backend, APIs, database, and deployment planning."
  }
];

export function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[var(--sf-warm)] text-[#17120f]">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm font-medium text-[#5f564f] md:flex">
          <a href="#modes">Modes</a>
          <a href="#workspace">Workspace</a>
          <a href="#extension">Extension</a>
          <a href="#pricing">Pricing</a>
        </nav>
        <ButtonLink href="/dashboard" size="sm">
          Start Forging
        </ButtonLink>
      </header>

      <section className="mx-auto grid w-full max-w-7xl items-center gap-10 px-5 pb-12 pt-10 sm:px-8 lg:min-h-[calc(100svh-180px)] lg:grid-cols-[0.92fr_1.08fr] lg:pb-14">
        <div className="flex max-w-3xl flex-col gap-8">
          <div className="flex flex-col gap-5">
            <h1 className="max-w-4xl text-5xl font-semibold leading-[0.96] tracking-tight text-[#111111] sm:text-7xl">
              Forge production-grade AI intelligence.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[#5f564f] sm:text-xl">
              From rough ideas to expert prompts, agents, code, and creative systems.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/dashboard" size="lg">
              Start Forging
              <ArrowRight aria-hidden="true" />
            </ButtonLink>
            <ButtonLink href="#workspace" variant="outline" size="lg">
              View Workspace
            </ButtonLink>
          </div>
        </div>

        <div className="rounded-lg border border-black/10 bg-white p-3 shadow-[0_30px_120px_rgba(17,17,17,0.12)]">
          <div className="rounded-md border border-black/10 bg-[#faf7f4]">
            <div className="flex items-center justify-between border-b border-black/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <Command aria-hidden="true" />
                <span className="text-sm font-semibold">Universal Forge Bar</span>
              </div>
              <span className="rounded-md border border-black/10 bg-white px-2 py-1 text-xs text-[#6b625b]">⌘ K</span>
            </div>
            <div className="grid gap-4 p-4 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="flex flex-col gap-3">
                <div className="rounded-lg border border-black/10 bg-white p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#9a7060]">Intent</p>
                  <p className="mt-3 text-lg font-semibold">Luxury jaggery chocolate campaign</p>
                  <p className="mt-2 text-sm leading-6 text-[#6b625b]">
                    Auto-detected as Create mode with cinematic food photography, premium audience, and commercial mood.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {["Create", "OpenAI", "Premium", "Saved"].map((label) => (
                    <div key={label} className="rounded-lg border border-black/10 bg-white px-3 py-3 text-sm font-medium">
                      {label}
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg bg-[#111111] p-5 text-white">
                <p className="text-sm font-medium text-[#ffb37a]">Generated Output</p>
                <div className="mt-4 flex flex-col gap-4">
                  {["Final Prompt", "Lighting", "Camera", "Composition"].map((label) => (
                    <div key={label} className="rounded-md border border-white/10 bg-white/[0.06] p-3">
                      <p className="text-sm font-semibold">{label}</p>
                      <p className="mt-1 text-xs leading-5 text-white/64">
                        Structured production detail ready for image, video, and campaign workflows.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="modes" className="border-y border-black/10 bg-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-5 py-16 sm:px-8 lg:grid-cols-4">
          {modes.map((item) => (
            <Card key={item.mode} className="shadow-none">
              <CardHeader>
                <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-[#111111] text-[var(--sf-orange)]">
                  <ModeIcon mode={item.mode} />
                </div>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.body}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section id="workspace" className="mx-auto grid max-w-7xl gap-8 px-5 py-20 sm:px-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="flex flex-col justify-center gap-5">
          <h2 className="text-4xl font-semibold tracking-tight">One workspace for intent, memory, and execution.</h2>
          <p className="text-lg leading-8 text-[#625952]">
            Projects store prompts, workflows, provider choices, brand tone, and generation history so every output can become
            the next action.
          </p>
          <div className="flex flex-wrap gap-2">
            {["Projects", "Templates", "History", "Settings"].map((item) => (
              <Badge key={item}>{item}</Badge>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ["Workspace Memory", Database, "Prompts, versions, workflows, favorites, and usage events."],
            ["Server Provider Layer", LockKeyhole, "Platform keys stay behind server APIs with quotas and logs."],
            ["Context Panel", PanelRight, "Page, selection, project, and advanced controls stay visible."],
            ["Workflow Continuation", Workflow, "Every generation can chain into video, campaign, build, or export."]
          ].map(([title, Icon, body]) => (
            <Card key={title as string}>
              <CardHeader>
                <Icon aria-hidden="true" />
                <CardTitle>{title as string}</CardTitle>
                <CardDescription>{body as string}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section id="extension" className="bg-[#111111] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_1fr]">
          <div className="flex flex-col justify-center gap-5">
            <Chrome aria-hidden="true" className="text-[var(--sf-orange)]" />
            <h2 className="text-4xl font-semibold tracking-tight">Available wherever intent appears.</h2>
            <p className="text-lg leading-8 text-white/66">
              The Chrome extension ships with the MVP: popup command bar, highlighted text actions, page context capture, and
              extension-to-web handoff.
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
            <div className="rounded-lg bg-white p-4 text-[#17120f]">
              <div className="flex items-center justify-between border-b border-black/10 pb-3">
                <Logo compact />
                <span className="text-xs text-[#6b625b]">Extension Popup</span>
              </div>
              <div className="mt-4 rounded-lg border border-black/10 p-4">
                <p className="text-sm font-medium text-[#6b625b]">Selected text action</p>
                <p className="mt-2 font-semibold">Improve this copy for a premium audience</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                {["Enhance", "Summarize", "Generate Prompt", "Build Campaign"].map((item) => (
                  <div key={item} className="rounded-lg bg-[#f6f1ec] px-3 py-3 font-medium">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <h2 className="text-4xl font-semibold tracking-tight">Templates that start workflows.</h2>
            <p className="mt-3 max-w-2xl text-[#625952]">Reusable intelligence systems for strategy, creative, build, and agents.</p>
          </div>
          <ButtonLink href="/templates" variant="outline">
            Browse Templates
          </ButtonLink>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <Badge>{template.mode}</Badge>
                <CardTitle>{template.title}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section id="pricing" className="border-t border-black/10 bg-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-5 py-20 sm:px-8 lg:grid-cols-3">
          {[
            ["Free", "Limited generations, projects, and basic intelligence."],
            ["Pro", "Unlimited prompts, local AI support, workflows, and exports."],
            ["Team", "Shared workspaces, collaboration, API access, and organization memory."]
          ].map(([title, body]) => (
            <Card key={title} className={title === "Pro" ? "border-[var(--sf-orange)]" : undefined}>
              <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{body}</CardDescription>
              </CardHeader>
              <CardContent>
                <ButtonLink href="/dashboard" variant={title === "Pro" ? "primary" : "outline"} className="w-full">
                  Start {title}
                </ButtonLink>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-[#6b625b] sm:px-8 md:flex-row md:items-center md:justify-between">
        <Logo />
        <p>Forge intelligence from ideas.</p>
      </footer>
    </main>
  );
}
