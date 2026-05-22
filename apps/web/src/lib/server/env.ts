import type { AIProviderId } from "@senseforge/shared";
import type { ProviderSecrets } from "@senseforge/ai";

const truthy = new Set(["1", "true", "yes", "on"]);

export function getProviderSecrets(): ProviderSecrets {
  return {
    openaiApiKey: process.env.OPENAI_API_KEY,
    geminiApiKey: process.env.GEMINI_API_KEY,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    openrouterApiKey: process.env.OPENROUTER_API_KEY
  };
}

export function allowMocks() {
  return truthy.has((process.env.SENSEFORGE_ALLOW_MOCKS ?? "true").toLowerCase());
}

export function getDefaultProvider(): AIProviderId {
  const provider = process.env.SENSEFORGE_DEFAULT_PROVIDER;
  if (provider === "openai" || provider === "gemini" || provider === "anthropic" || provider === "openrouter") {
    return provider;
  }

  return "openai";
}

export function getDailyFreeLimit() {
  const parsed = Number(process.env.SENSEFORGE_DAILY_FREE_LIMIT ?? "25");
  return Number.isFinite(parsed) ? parsed : 25;
}

export function hasSupabaseServerConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}
