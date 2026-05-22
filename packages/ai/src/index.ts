import {
  aiProviders,
  countApproxTokens,
  defaultModels,
  type AIGenerateOptions,
  type AIMessage,
  type AIProvider,
  type AIProviderId,
  type ForgeMode,
  type ForgeRequest,
  type ForgeResult,
  type ForgeSection,
  type ProviderModel
} from "@senseforge/shared";
import {
  fallbackForgeSections,
  runPromptPipeline,
  summarizeFallback
} from "@senseforge/prompt-engine";

export type ProviderSecrets = Partial<Record<`${AIProviderId}ApiKey`, string>>;

export type ForgeRuntimeConfig = {
  secrets?: ProviderSecrets;
  allowMocks?: boolean;
  defaultProvider?: AIProviderId;
  userId?: string;
};

type OpenAICompatibleConfig = {
  id: AIProviderId;
  label: string;
  apiKey?: string;
  baseUrl: string;
  models: ProviderModel[];
  extraHeaders?: Record<string, string>;
};

const jsonHeaders = {
  "Content-Type": "application/json"
};

function assertFetchResponse(response: Response, provider: AIProviderId) {
  if (!response.ok) {
    throw new Error(`${provider} request failed with ${response.status}`);
  }
}

function openAICompatibleProvider(config: OpenAICompatibleConfig): AIProvider {
  return {
    id: config.id,
    label: config.label,
    models: () => config.models,
    async generate(messages: AIMessage[], model: string, options?: AIGenerateOptions) {
      if (!config.apiKey) {
        throw new Error(`${config.label} API key is not configured`);
      }

      const response = await fetch(`${config.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          ...jsonHeaders,
          Authorization: `Bearer ${config.apiKey}`,
          ...config.extraHeaders
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: options?.temperature ?? 0.4,
          max_tokens: options?.maxTokens ?? 1600,
          response_format: options?.responseFormat === "json" ? { type: "json_object" } : undefined
        })
      });

      assertFetchResponse(response, config.id);
      const payload = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };

      return payload.choices?.[0]?.message?.content?.trim() ?? "";
    }
  };
}

function geminiProvider(apiKey?: string): AIProvider {
  const models = defaultModels.filter((model) => model.provider === "gemini");

  return {
    id: "gemini",
    label: "Gemini",
    models: () => models,
    async generate(messages: AIMessage[], model: string, options?: AIGenerateOptions) {
      if (!apiKey) {
        throw new Error("Gemini API key is not configured");
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: jsonHeaders,
          body: JSON.stringify({
            generationConfig: {
              temperature: options?.temperature ?? 0.4,
              maxOutputTokens: options?.maxTokens ?? 1600,
              responseMimeType: options?.responseFormat === "json" ? "application/json" : "text/plain"
            },
            contents: messages.map((message) => ({
              role: message.role === "assistant" ? "model" : "user",
              parts: [{ text: message.role === "system" ? `System: ${message.content}` : message.content }]
            }))
          })
        }
      );

      assertFetchResponse(response, "gemini");
      const payload = (await response.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };

      return payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim() ?? "";
    }
  };
}

function anthropicProvider(apiKey?: string): AIProvider {
  const models = defaultModels.filter((model) => model.provider === "anthropic");

  return {
    id: "anthropic",
    label: "Anthropic",
    models: () => models,
    async generate(messages: AIMessage[], model: string, options?: AIGenerateOptions) {
      if (!apiKey) {
        throw new Error("Anthropic API key is not configured");
      }

      const system = messages.find((message) => message.role === "system")?.content;
      const userMessages = messages.filter((message) => message.role !== "system");

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          ...jsonHeaders,
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model,
          max_tokens: options?.maxTokens ?? 1600,
          temperature: options?.temperature ?? 0.4,
          system,
          messages: userMessages
        })
      });

      assertFetchResponse(response, "anthropic");
      const payload = (await response.json()) as {
        content?: Array<{ type: string; text?: string }>;
      };

      return payload.content?.map((part) => part.text ?? "").join("").trim() ?? "";
    }
  };
}

export function createProviders(secrets: ProviderSecrets = {}): AIProvider[] {
  return [
    openAICompatibleProvider({
      id: "openai",
      label: "OpenAI",
      apiKey: secrets.openaiApiKey,
      baseUrl: "https://api.openai.com/v1",
      models: defaultModels.filter((model) => model.provider === "openai")
    }),
    geminiProvider(secrets.geminiApiKey),
    anthropicProvider(secrets.anthropicApiKey),
    openAICompatibleProvider({
      id: "openrouter",
      label: "OpenRouter",
      apiKey: secrets.openrouterApiKey,
      baseUrl: "https://openrouter.ai/api/v1",
      models: defaultModels.filter((model) => model.provider === "openrouter"),
      extraHeaders: {
        "HTTP-Referer": "https://senseforge.local",
        "X-Title": "SenseForge"
      }
    })
  ];
}

export function listModels(secrets: ProviderSecrets = {}) {
  const configured = new Set(
    aiProviders.filter((provider) => Boolean(secrets[`${provider}ApiKey` as const]))
  );

  return defaultModels.map((model) => ({
    ...model,
    configured: configured.has(model.provider)
  }));
}

export function resolveProvider(
  providers: AIProvider[],
  requestedProvider?: AIProviderId,
  fallbackProvider: AIProviderId = "openai"
) {
  return (
    providers.find((provider) => provider.id === requestedProvider) ??
    providers.find((provider) => provider.id === fallbackProvider) ??
    providers[0]
  );
}

export function resolveModel(provider: AIProvider, mode: ForgeMode, requestedModel?: string) {
  if (requestedModel && provider.models().some((model) => model.id === requestedModel)) {
    return requestedModel;
  }

  return (
    provider.models().find((model) => model.defaultFor?.includes(mode))?.id ??
    provider.models()[0]?.id ??
    defaultModels.find((model) => model.provider === provider.id)?.id ??
    "senseforge-mock"
  );
}

export function parseSectionsFromText(text: string, fallback: ForgeSection[]): ForgeSection[] {
  const matches = [...text.matchAll(/^#{2,3}\s+(.+)$([\s\S]*?)(?=^#{2,3}\s+|\s*$)/gm)];
  if (!matches.length) {
    return fallback;
  }

  return matches.map((match) => ({
    title: match[1].trim(),
    body: match[2].trim()
  }));
}

export async function forge(request: ForgeRequest, config: ForgeRuntimeConfig = {}): Promise<ForgeResult> {
  const pipeline = runPromptPipeline(request);
  const providers = createProviders(config.secrets);
  const provider = resolveProvider(providers, request.provider, config.defaultProvider);
  const model = resolveModel(provider, pipeline.classification.mode, request.model);
  const fallbackSections = fallbackForgeSections(request.input, pipeline.classification.mode);

  let generatedText = "";
  let sections = fallbackSections;

  try {
    generatedText = await provider.generate(
      [
        { role: "system", content: pipeline.systemPrompt },
        { role: "user", content: pipeline.userPrompt }
      ],
      model,
      {
        temperature: pipeline.classification.mode === "create" ? 0.7 : 0.35,
        maxTokens: 1800
      }
    );
    sections = parseSectionsFromText(generatedText, fallbackSections);
  } catch (error) {
    if (!config.allowMocks) {
      throw error;
    }
    generatedText = fallbackSections.map((section) => `## ${section.title}\n${section.body}`).join("\n\n");
  }

  const outputText = sections.map((section) => `${section.title}\n${section.body}`).join("\n\n");

  return {
    id: crypto.randomUUID(),
    mode: pipeline.classification.mode,
    provider: provider.id,
    model,
    title: createResultTitle(request.input, pipeline.classification.mode),
    summary: summarizeFallback(request.input, pipeline.classification.mode),
    structure: pipeline.structure,
    sections,
    nextActions: pipeline.nextActions,
    usage: {
      userId: config.userId,
      provider: provider.id,
      model,
      mode: pipeline.classification.mode,
      inputTokens: countApproxTokens(pipeline.systemPrompt + pipeline.userPrompt),
      outputTokens: countApproxTokens(outputText || generatedText)
    },
    createdAt: new Date().toISOString()
  };
}

export function createResultTitle(input: string, mode: ForgeMode) {
  const prefix: Record<ForgeMode, string> = {
    think: "Strategy",
    create: "Creative System",
    build: "Build Blueprint",
    agents: "Agent Workflow"
  };

  const trimmed = input.replace(/\s+/g, " ").slice(0, 64);
  return `${prefix[mode]}: ${trimmed}`;
}
