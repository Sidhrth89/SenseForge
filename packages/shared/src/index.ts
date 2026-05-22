import { z } from "zod";

export const forgeModes = ["think", "create", "build", "agents"] as const;
export const aiProviders = ["openai", "gemini", "anthropic", "openrouter"] as const;
export const outputFormats = ["strategy", "creative_prompt", "architecture", "workflow"] as const;

export type ForgeMode = (typeof forgeModes)[number];
export type AIProviderId = (typeof aiProviders)[number];
export type OutputFormat = (typeof outputFormats)[number];

export const ForgeModeSchema = z.enum(forgeModes);
export const AIProviderIdSchema = z.enum(aiProviders);
export const OutputFormatSchema = z.enum(outputFormats);

export const ContextPayloadSchema = z.object({
  source: z.enum(["web", "extension", "popup", "selection"]).default("web"),
  url: z.string().url().optional(),
  title: z.string().optional(),
  selectedText: z.string().max(20000).optional(),
  pageText: z.string().max(50000).optional(),
  appHint: z.string().optional()
});

export type ContextPayload = z.infer<typeof ContextPayloadSchema>;

export const ForgeRequestSchema = z.object({
  input: z.string().trim().min(2).max(20000),
  mode: ForgeModeSchema.optional(),
  provider: AIProviderIdSchema.optional(),
  model: z.string().optional(),
  projectId: z.string().uuid().optional(),
  context: ContextPayloadSchema.optional(),
  save: z.boolean().default(false)
});

export type ForgeRequest = z.infer<typeof ForgeRequestSchema>;

export const PromptStructureSchema = z.object({
  goal: z.string(),
  mode: ForgeModeSchema,
  style: z.string().optional(),
  audience: z.string().optional(),
  lighting: z.string().optional(),
  camera: z.string().optional(),
  mood: z.string().optional(),
  platform: z.string().optional(),
  negativePrompt: z.array(z.string()).default([]),
  sections: z.array(z.string()).default([])
});

export type PromptStructure = z.infer<typeof PromptStructureSchema>;

export type ForgeSection = {
  title: string;
  body: string;
  items?: string[];
};

export type ForgeNextAction = {
  label: string;
  mode: ForgeMode;
  input: string;
};

export type ForgeResult = {
  id: string;
  mode: ForgeMode;
  provider: AIProviderId;
  model: string;
  title: string;
  summary: string;
  structure: PromptStructure;
  sections: ForgeSection[];
  nextActions: ForgeNextAction[];
  usage: UsageEvent;
  createdAt: string;
};

export type ProviderCapability = "text" | "stream" | "vision" | "embeddings" | "json";

export type ProviderModel = {
  id: string;
  provider: AIProviderId;
  label: string;
  capabilities: ProviderCapability[];
  contextWindow?: number;
  defaultFor?: ForgeMode[];
};

export type AIGenerateOptions = {
  temperature?: number;
  maxTokens?: number;
  responseFormat?: "text" | "json";
};

export type AIMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type AIProvider = {
  id: AIProviderId;
  label: string;
  models(): ProviderModel[];
  generate(messages: AIMessage[], model: string, options?: AIGenerateOptions): Promise<string>;
  stream?(messages: AIMessage[], model: string, options?: AIGenerateOptions): AsyncIterable<string>;
  embeddings?(input: string[]): Promise<number[][]>;
};

export type Project = {
  id: string;
  userId: string;
  name: string;
  description?: string;
  brandTone?: string;
  createdAt: string;
  updatedAt: string;
};

export type PromptVersion = {
  id: string;
  promptId: string;
  version: number;
  input: string;
  output: ForgeResult;
  createdAt: string;
};

export type WorkflowBlock = {
  id: string;
  mode: ForgeMode;
  label: string;
  inputTemplate: string;
};

export type WorkflowDefinition = {
  id: string;
  userId: string;
  projectId?: string;
  name: string;
  blocks: WorkflowBlock[];
  createdAt: string;
  updatedAt: string;
};

export type AgentRunStatus = "queued" | "running" | "succeeded" | "failed";

export type AgentRun = {
  id: string;
  workflowId?: string;
  userId: string;
  status: AgentRunStatus;
  input: string;
  output?: ForgeResult[];
  logs: string[];
  createdAt: string;
  updatedAt: string;
};

export type UsageEvent = {
  userId?: string;
  provider: AIProviderId;
  model: string;
  mode: ForgeMode;
  inputTokens: number;
  outputTokens: number;
  costUsd?: number;
};

export type Template = {
  id: string;
  mode: ForgeMode;
  title: string;
  description: string;
  prompt: string;
};

export const defaultModels: ProviderModel[] = [
  {
    id: "gpt-4.1-mini",
    provider: "openai",
    label: "OpenAI GPT-4.1 Mini",
    capabilities: ["text", "stream", "json"],
    contextWindow: 1047576,
    defaultFor: ["think", "create", "build", "agents"]
  },
  {
    id: "gemini-2.5-flash",
    provider: "gemini",
    label: "Gemini 2.5 Flash",
    capabilities: ["text", "stream", "json", "vision"],
    contextWindow: 1048576,
    defaultFor: ["create", "think"]
  },
  {
    id: "claude-sonnet-4-5",
    provider: "anthropic",
    label: "Claude Sonnet 4.5",
    capabilities: ["text", "stream", "json"],
    contextWindow: 200000,
    defaultFor: ["think", "build"]
  },
  {
    id: "openai/gpt-4.1-mini",
    provider: "openrouter",
    label: "OpenRouter GPT-4.1 Mini",
    capabilities: ["text", "stream", "json"],
    contextWindow: 1047576,
    defaultFor: ["agents"]
  }
];

export const templates: Template[] = [
  {
    id: "luxury-campaign",
    mode: "create",
    title: "Luxury Campaign Prompt",
    description: "Turn a rough product idea into a full cinematic campaign prompt.",
    prompt: "Create a luxury product campaign for [brand/product] with camera, lighting, mood, platform optimization, and negative prompt."
  },
  {
    id: "strategy-roadmap",
    mode: "think",
    title: "Strategy Roadmap",
    description: "Consulting-grade analysis with risks, opportunities, and execution plan.",
    prompt: "Analyze [business question] and return insights, opportunities, risks, recommendations, and a 30-day execution roadmap."
  },
  {
    id: "saas-blueprint",
    mode: "build",
    title: "SaaS Build Blueprint",
    description: "Generate architecture, APIs, database, deployment, and implementation plan.",
    prompt: "Build a scalable SaaS blueprint for [product] with frontend, backend, database schema, APIs, auth, and deployment."
  },
  {
    id: "workflow-chain",
    mode: "agents",
    title: "Campaign Workflow Chain",
    description: "Research, copywriting, visual prompt, and export workflow.",
    prompt: "Create an agentic workflow for [campaign/project] from research to final campaign export."
  }
];

export const countApproxTokens = (value: string) => Math.max(1, Math.ceil(value.length / 4));
