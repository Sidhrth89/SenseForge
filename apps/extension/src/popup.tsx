import { useEffect, useMemo, useState } from "react";
import type { AIProviderId, ForgeMode, ForgeResult } from "@senseforge/shared";
import type { StoredContext } from "./types";
import "./style.css";

const modes: ForgeMode[] = ["think", "create", "build", "agents"];
const providers: AIProviderId[] = ["openai", "gemini", "anthropic", "openrouter"];

function Popup() {
  const [context, setContext] = useState<StoredContext | null>(null);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<ForgeMode>("think");
  const [provider, setProvider] = useState<AIProviderId>("openai");
  const [apiBase, setApiBase] = useState("http://localhost:3000");
  const [result, setResult] = useState<ForgeResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    chrome.storage.local.get(["senseforgeContext", "senseforgeApiBase"], (items) => {
      const stored = items.senseforgeContext as StoredContext | undefined;
      const base = items.senseforgeApiBase as string | undefined;
      if (stored) {
        setContext(stored);
        setInput(stored.selectedText ? `Improve this text:\n${stored.selectedText}` : `Summarize this page: ${stored.title}`);
      }
      if (base) {
        setApiBase(base);
      }
    });
  }, []);

  const contextLabel = useMemo(() => {
    if (!context) {
      return "No page context captured";
    }
    return context.selectedText ? "Selected text captured" : context.title ?? "Page context captured";
  }, [context]);

  async function runForge(nextInput = input, nextMode = mode) {
    setIsRunning(true);
    setError(null);
    try {
      chrome.storage.local.set({ senseforgeApiBase: apiBase });
      const response = await fetch(`${apiBase}/api/forge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: nextInput,
          mode: nextMode,
          provider,
          save: true,
          context: context ?? { source: "popup" }
        })
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Forge request failed");
      }

      const payload = (await response.json()) as { result: ForgeResult };
      setResult(payload.result);
    } catch (runError) {
      setError(runError instanceof Error ? runError.message : "Forge request failed");
    } finally {
      setIsRunning(false);
    }
  }

  const quickActions: Array<[string, ForgeMode, string]> = [
    ["Enhance", "think", "Improve this with stronger clarity, structure, and premium positioning:"],
    ["Summarize", "think", "Summarize the key points and next actions:"],
    ["Generate Prompt", "create", "Turn this into a production-grade creative prompt:"],
    ["Build Campaign", "agents", "Create a campaign workflow from this context:"]
  ];

  return (
    <main className="popup">
      <header className="topbar">
        <div>
          <p className="brand">SenseForge</p>
          <p className="muted">{contextLabel}</p>
        </div>
        <span className="hotkey">⌘K</span>
      </header>

      <label className="field">
        <span>API base</span>
        <input value={apiBase} onChange={(event) => setApiBase(event.target.value)} />
      </label>

      <textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder="What do you want to forge?" />

      <div className="switcher">
        {modes.map((item) => (
          <button key={item} className={item === mode ? "active" : ""} onClick={() => setMode(item)}>
            {item}
          </button>
        ))}
      </div>

      <div className="switcher providers">
        {providers.map((item) => (
          <button key={item} className={item === provider ? "active" : ""} onClick={() => setProvider(item)}>
            {item}
          </button>
        ))}
      </div>

      <button className="primary" onClick={() => void runForge()} disabled={isRunning || input.trim().length < 2}>
        {isRunning ? "Forging..." : "Forge"}
      </button>

      <div className="quick">
        {quickActions.map(([label, nextMode, prefix]) => (
          <button
            key={label}
            onClick={() => {
              const nextInput = `${prefix}\n${context?.selectedText ?? input}`;
              setMode(nextMode);
              setInput(nextInput);
              void runForge(nextInput, nextMode);
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {error ? <p className="error">{error}</p> : null}

      {result ? (
        <section className="result">
          <h1>{result.title}</h1>
          <p>{result.summary}</p>
          {result.sections.slice(0, 3).map((section) => (
            <article key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </article>
          ))}
        </section>
      ) : null}
    </main>
  );
}

export default Popup;
