import { describe, expect, it } from "vitest";
import { forge, listModels, resolveModel, resolveProvider } from "../src";
import { createProviders } from "../src";

describe("ai provider layer", () => {
  it("marks configured providers from platform keys", () => {
    const models = listModels({ openaiApiKey: "sk-test" });
    expect(models.find((model) => model.provider === "openai")?.configured).toBe(true);
    expect(models.find((model) => model.provider === "gemini")?.configured).toBe(false);
  });

  it("resolves requested provider and default model", () => {
    const provider = resolveProvider(createProviders(), "gemini");
    expect(provider.id).toBe("gemini");
    expect(resolveModel(provider, "create")).toBe("gemini-2.5-flash");
  });

  it("returns mock forge output when provider keys are unavailable and mocks are allowed", async () => {
    const result = await forge(
      {
        input: "Luxury jaggery chocolate campaign",
        mode: "create",
        provider: "openai",
        save: false
      },
      { allowMocks: true }
    );

    expect(result.mode).toBe("create");
    expect(result.sections.some((section) => section.title === "Final Prompt")).toBe(true);
  });
});
