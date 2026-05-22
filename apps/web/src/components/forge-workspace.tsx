"use client";

import { useEffect } from "react";
import { Command, Loader2, Save, WandSparkles } from "lucide-react";
import { aiProviders, forgeModes, type AIProviderId, type ForgeMode } from "@senseforge/shared";
import { useForgeStore } from "@/lib/client/forge-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
import { ModeIcon } from "@/components/mode-icon";
import { cn } from "@/lib/utils";

const modeCopy: Record<ForgeMode, string> = {
  think: "Strategy, analysis, recommendations, and execution plan.",
  create: "Prompts, lighting, camera, composition, mood, and platform optimization.",
  build: "Architecture, code systems, APIs, database, deployment, and optimization.",
  agents: "Workflow blocks, context inputs, automation steps, and run controls."
};

export function ForgeWorkspace() {
  const { input, mode, provider, result, history, isRunning, error, setInput, setMode, setProvider, runForge } =
    useForgeStore();

  useEffect(() => {
    if (!result && !isRunning) {
      void runForge({ save: false });
    }
  }, [isRunning, result, runForge]);

  return (
    <div className="grid min-h-[calc(100svh-32px)] gap-4 bg-[#f7f1eb] p-4 text-[#17120f] lg:grid-cols-[250px_minmax(0,1fr)_310px]">
      <aside className="rounded-lg border border-black/10 bg-white/80 p-4">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-[#111111] text-[var(--sf-orange)]">
            <Command aria-hidden="true" />
          </div>
          <div>
            <p className="font-semibold">SenseForge</p>
            <p className="text-xs text-[#736a62]">AI command center</p>
          </div>
        </div>
        <nav className="mt-8 flex flex-col gap-1 text-sm">
          {["Home", "Projects", "Templates", "History", "Settings"].map((item) => (
            <a
              key={item}
              href={item === "Home" ? "/dashboard" : `/${item.toLowerCase()}`}
              className={cn(
                "rounded-lg px-3 py-2 font-medium text-[#5f564f] hover:bg-black/5",
                item === "Home" && "bg-[#111111] text-white hover:bg-[#111111]"
              )}
            >
              {item}
            </a>
          ))}
        </nav>
        <div className="mt-8 rounded-lg bg-[#111111] p-4 text-white">
          <p className="text-sm font-semibold">Platform keys</p>
          <p className="mt-2 text-xs leading-5 text-white/62">
            Provider secrets stay server-side. Browser and extension requests only talk to SenseForge APIs.
          </p>
        </div>
      </aside>

      <main className="flex min-w-0 flex-col gap-4">
        <section className="rounded-lg border border-black/10 bg-white p-5">
          <div className="mb-5 flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">What do you want to forge today?</h1>
              <p className="mt-2 text-sm text-[#6b625b]">{modeCopy[mode]}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {forgeModes.map((item) => (
                <button
                  key={item}
                  onClick={() => setMode(item)}
                  className={cn(
                    "inline-flex h-10 items-center gap-2 rounded-lg border border-black/10 bg-white px-3 text-sm font-medium capitalize transition hover:bg-[#faf7f4]",
                    item === mode && "border-[var(--sf-orange)] bg-[#fff3e8] text-[#b84f00]"
                  )}
                >
                  <ModeIcon mode={item} />
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[0.82fr_1.18fr]">
            <div className="flex flex-col gap-4">
              <Textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Luxury sneaker campaign, build SaaS dashboard, research competitors..."
                className="min-h-48 text-base"
              />
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button onClick={() => void runForge({ save: true })} disabled={isRunning || input.trim().length < 2} size="lg">
                  {isRunning ? <Loader2 className="animate-spin" aria-hidden="true" /> : <WandSparkles aria-hidden="true" />}
                  Forge
                </Button>
                <Button variant="outline" size="lg" onClick={() => void runForge({ save: false })} disabled={isRunning}>
                  <Save aria-hidden="true" />
                  Preview
                </Button>
              </div>
              {error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
            </div>

            <Card className="min-h-[420px] shadow-none">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle>{result?.title ?? "Generated Output"}</CardTitle>
                    <CardDescription>{result?.summary ?? "SenseForge will structure output into mode-specific sections."}</CardDescription>
                  </div>
                  {result ? (
                    <Badge>
                      {result.provider} / {result.model}
                    </Badge>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {(result?.sections ?? []).map((section) => (
                    <section key={section.title} className="rounded-lg border border-black/10 bg-[#fffdfa] p-4">
                      <h3 className="font-semibold">{section.title}</h3>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#625952]">{section.body}</p>
                    </section>
                  ))}
                  {!result && !isRunning ? (
                    <div className="rounded-lg border border-dashed border-black/15 p-8 text-center text-sm text-[#6b625b]">
                      Run the forge bar to generate a structured result.
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {(result?.nextActions ?? []).map((action) => (
            <button
              key={action.label}
              onClick={() => {
                setMode(action.mode);
                setInput(action.input);
                void runForge({ input: action.input, mode: action.mode, save: true });
              }}
              className="rounded-lg border border-black/10 bg-white p-4 text-left transition hover:border-[var(--sf-orange)]"
            >
              <Badge>{action.mode}</Badge>
              <p className="mt-3 font-semibold">{action.label}</p>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#6b625b]">{action.input}</p>
            </button>
          ))}
        </section>
      </main>

      <aside className="rounded-lg border border-black/10 bg-white/80 p-4">
        <div>
          <p className="text-sm font-semibold">Advanced Controls</p>
          <p className="mt-1 text-xs leading-5 text-[#736a62]">Provider routing, mode settings, context, and recent memory.</p>
        </div>
        <div className="mt-5 flex flex-col gap-2">
          {aiProviders.map((item) => (
            <button
              key={item}
              onClick={() => setProvider(item as AIProviderId)}
              className={cn(
                "flex h-10 items-center justify-between rounded-lg border border-black/10 bg-white px-3 text-sm font-medium capitalize",
                provider === item && "border-[var(--sf-orange)] bg-[#fff3e8] text-[#b84f00]"
              )}
            >
              {item}
              <span className="text-xs text-[#8c8178]">server</span>
            </button>
          ))}
        </div>

        <div className="mt-6">
          <p className="text-sm font-semibold">Context</p>
          <div className="mt-3 rounded-lg border border-black/10 bg-white p-3 text-sm leading-6 text-[#6b625b]">
            Source: Web workspace
            <br />
            Project: GUDLILY Launch Campaign
            <br />
            Memory: brand tone, prompts, workflows
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm font-semibold">Recent Generations</p>
          <div className="mt-3 flex flex-col gap-2">
            {history.length ? (
              history.map((item) => (
                <button
                  key={item.id}
                  className="rounded-lg border border-black/10 bg-white p-3 text-left"
                  onClick={() => setInput(item.structure.goal)}
                >
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  <p className="mt-1 text-xs capitalize text-[#8c8178]">{item.mode}</p>
                </button>
              ))
            ) : (
              <p className="rounded-lg border border-dashed border-black/15 p-3 text-sm text-[#8c8178]">No history yet.</p>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
