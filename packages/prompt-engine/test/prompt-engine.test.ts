import { describe, expect, it } from "vitest";
import { classifyIntent, runPromptPipeline } from "../src";

describe("prompt engine", () => {
  it("detects create intent from campaign language", () => {
    const result = classifyIntent("Luxury jaggery chocolate cinematic campaign");
    expect(result.mode).toBe("create");
    expect(result.signals).toContain("campaign");
  });

  it("respects explicit mode over heuristic signals", () => {
    const result = classifyIntent("Build campaign prompt", "build");
    expect(result.mode).toBe("build");
    expect(result.confidence).toBe(1);
  });

  it("creates required create-mode sections", () => {
    const result = runPromptPipeline({
      input: "Luxury sneaker campaign",
      mode: "create",
      save: false
    });

    expect(result.structure.sections).toContain("Final Prompt");
    expect(result.userPrompt).toContain("Luxury sneaker campaign");
    expect(result.nextActions.length).toBeGreaterThan(0);
  });
});
