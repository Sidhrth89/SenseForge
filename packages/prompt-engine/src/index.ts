import {
  countApproxTokens,
  type ContextPayload,
  type ForgeMode,
  type ForgeNextAction,
  type ForgeRequest,
  type ForgeSection,
  type OutputFormat,
  type PromptStructure
} from "@senseforge/shared";

export type IntentClassification = {
  mode: ForgeMode;
  confidence: number;
  format: OutputFormat;
  signals: string[];
};

export type PromptPipelineResult = {
  classification: IntentClassification;
  structure: PromptStructure;
  systemPrompt: string;
  userPrompt: string;
  outputSections: string[];
  nextActions: ForgeNextAction[];
};

const modeSignals: Record<ForgeMode, string[]> = {
  think: [
    "strategy",
    "analyze",
    "research",
    "plan",
    "position",
    "market",
    "competitor",
    "growth",
    "risk",
    "recommend"
  ],
  create: [
    "campaign",
    "prompt",
    "image",
    "video",
    "cinematic",
    "photo",
    "brand",
    "ad",
    "creative",
    "visual",
    "midjourney",
    "runway",
    "kling",
    "veo"
  ],
  build: [
    "build",
    "app",
    "saas",
    "api",
    "database",
    "code",
    "debug",
    "next.js",
    "react",
    "architecture",
    "deploy"
  ],
  agents: [
    "workflow",
    "agent",
    "automation",
    "mcp",
    "chain",
    "orchestrate",
    "browser",
    "github",
    "filesystem",
    "pipeline"
  ]
};

const sectionMap: Record<ForgeMode, string[]> = {
  think: ["Analysis", "Opportunities", "Risks", "Strategy", "Recommendations", "Execution Plan"],
  create: [
    "Final Prompt",
    "Negative Prompt",
    "Lighting",
    "Camera",
    "Composition",
    "Mood",
    "Platform Optimization"
  ],
  build: ["Architecture", "Frontend", "Backend", "Database", "APIs", "Deployment", "Optimization"],
  agents: ["Workflow Blocks", "Context Inputs", "Automation Steps", "Run Controls", "Failure Handling"]
};

const formatMap: Record<ForgeMode, OutputFormat> = {
  think: "strategy",
  create: "creative_prompt",
  build: "architecture",
  agents: "workflow"
};

export function classifyIntent(input: string, explicitMode?: ForgeMode): IntentClassification {
  if (explicitMode) {
    return {
      mode: explicitMode,
      confidence: 1,
      format: formatMap[explicitMode],
      signals: ["explicit-mode"]
    };
  }

  const normalized = input.toLowerCase();
  const scores = Object.entries(modeSignals).map(([mode, signals]) => {
    const matched = signals.filter((signal) => normalized.includes(signal));
    return {
      mode: mode as ForgeMode,
      score: matched.length,
      signals: matched
    };
  });

  const best = scores.sort((a, b) => b.score - a.score)[0];
  const mode = best && best.score > 0 ? best.mode : "think";
  const confidence = best && best.score > 0 ? Math.min(0.95, 0.45 + best.score * 0.12) : 0.42;

  return {
    mode,
    confidence,
    format: formatMap[mode],
    signals: best?.signals ?? []
  };
}

export function buildPromptStructure(
  input: string,
  classification: IntentClassification,
  context?: ContextPayload
): PromptStructure {
  const normalized = input.toLowerCase();
  const isLuxury = /(luxury|premium|cinematic|high[- ]end|elegant)/i.test(input);
  const platform =
    ["midjourney", "flux", "veo", "kling", "runway", "openai", "gemini"].find((candidate) =>
      normalized.includes(candidate)
    ) ?? (classification.mode === "create" ? "OpenAI / Midjourney ready" : undefined);

  return {
    goal: input,
    mode: classification.mode,
    style: isLuxury ? "premium, restrained, cinematic" : undefined,
    audience: normalized.includes("b2b") ? "B2B decision makers" : undefined,
    lighting: classification.mode === "create" ? (isLuxury ? "soft directional studio lighting" : "clean commercial lighting") : undefined,
    camera: classification.mode === "create" ? (isLuxury ? "macro lens, shallow depth of field" : "editorial product framing") : undefined,
    mood: isLuxury ? "calm, aspirational, high-trust" : undefined,
    platform,
    negativePrompt:
      classification.mode === "create"
        ? ["low quality", "cluttered composition", "distorted text", "generic stock image", "harsh oversaturation"]
        : [],
    sections: sectionMap[classification.mode].concat(context?.selectedText ? ["Context From Selection"] : [])
  };
}

export function buildSystemPrompt(mode: ForgeMode): string {
  const base =
    "You are SenseForge, an AI intelligence infrastructure engine. Convert rough human intent into production-grade execution. Be structured, specific, and practical.";

  const instructions: Record<ForgeMode, string> = {
    think:
      "Return consulting-grade strategic analysis with clear opportunities, risks, recommendations, and an execution roadmap.",
    create:
      "Return a creative intelligence package with final prompt, negative prompt, lighting, camera, composition, mood, and platform optimization.",
    build:
      "Return a software build blueprint with architecture, frontend, backend, database, APIs, deployment, and optimization notes.",
    agents:
      "Return an agentic workflow with blocks, context inputs, automation steps, run controls, and failure handling."
  };

  return `${base}\n\n${instructions[mode]}\nUse concise Markdown.`;
}

export function buildUserPrompt(request: ForgeRequest, structure: PromptStructure): string {
  const contextLines = [
    request.context?.title ? `Page title: ${request.context.title}` : undefined,
    request.context?.url ? `URL: ${request.context.url}` : undefined,
    request.context?.selectedText ? `Selected text:\n${request.context.selectedText}` : undefined,
    request.context?.pageText ? `Page context excerpt:\n${request.context.pageText.slice(0, 6000)}` : undefined
  ].filter(Boolean);

  return [
    `User intent: ${request.input}`,
    `Detected mode: ${structure.mode}`,
    structure.platform ? `Platform target: ${structure.platform}` : undefined,
    structure.style ? `Style: ${structure.style}` : undefined,
    contextLines.length ? `Context:\n${contextLines.join("\n\n")}` : undefined,
    `Required sections: ${structure.sections.join(", ")}`
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function createNextActions(input: string, mode: ForgeMode): ForgeNextAction[] {
  const actions: Record<ForgeMode, ForgeNextAction[]> = {
    think: [
      { label: "Turn into campaign", mode: "create", input: `Create a campaign from this strategy: ${input}` },
      { label: "Build execution system", mode: "build", input: `Build an execution system for this strategy: ${input}` },
      { label: "Create workflow", mode: "agents", input: `Create an agent workflow to execute this plan: ${input}` }
    ],
    create: [
      { label: "Generate video prompt", mode: "create", input: `Turn this into a cinematic video prompt: ${input}` },
      { label: "Create ad copy", mode: "think", input: `Create ad copy strategy for: ${input}` },
      { label: "Build landing page", mode: "build", input: `Build a landing page for this campaign: ${input}` }
    ],
    build: [
      { label: "Create implementation workflow", mode: "agents", input: `Create a build workflow for: ${input}` },
      { label: "Review architecture", mode: "think", input: `Review risks and tradeoffs for this build: ${input}` },
      { label: "Create launch creative", mode: "create", input: `Create launch visuals for this product: ${input}` }
    ],
    agents: [
      { label: "Explain workflow strategy", mode: "think", input: `Analyze this workflow: ${input}` },
      { label: "Generate workflow assets", mode: "create", input: `Create campaign assets for this workflow: ${input}` },
      { label: "Build workflow UI", mode: "build", input: `Build an interface for this workflow: ${input}` }
    ]
  };

  return actions[mode];
}

export function runPromptPipeline(request: ForgeRequest): PromptPipelineResult {
  const classification = classifyIntent(request.input, request.mode);
  const structure = buildPromptStructure(request.input, classification, request.context);
  const systemPrompt = buildSystemPrompt(classification.mode);
  const userPrompt = buildUserPrompt(request, structure);

  return {
    classification,
    structure,
    systemPrompt,
    userPrompt,
    outputSections: sectionMap[classification.mode],
    nextActions: createNextActions(request.input, classification.mode)
  };
}

export function fallbackForgeSections(input: string, mode: ForgeMode): ForgeSection[] {
  const core: Record<ForgeMode, [string, string][]> = {
    think: [
      ["Analysis", `SenseForge identified the central strategic question behind "${input}" and separated market position, audience motivation, and execution constraints.`],
      ["Opportunities", "Differentiate through a narrow promise, clear proof, and repeatable content systems. Prioritize offers that make the value obvious within one interaction."],
      ["Risks", "The largest risks are generic positioning, unclear proof, and trying to serve too many user segments before the first repeatable workflow is validated."],
      ["Strategy", "Use one primary wedge, one flagship workflow, and one measurable activation event. Convert every answer into a next action."],
      ["Recommendations", "Ship the smallest complete workflow, collect saved project usage, and refine templates around repeated demand."],
      ["Execution Plan", "Week 1: define offer and templates. Week 2: launch workflow. Week 3: measure activation and iterate."]
    ],
    create: [
      ["Final Prompt", `Create a premium AI-ready campaign for "${input}" with a clear subject, refined composition, commercial polish, and platform-ready detail.`],
      ["Negative Prompt", "low quality, clutter, distorted text, generic stock look, oversaturated colors, weak product focus"],
      ["Lighting", "Soft directional lighting, controlled highlights, gentle shadows, premium product emphasis."],
      ["Camera", "Editorial commercial framing with shallow depth of field and crisp subject separation."],
      ["Composition", "Single dominant focal point, generous negative space, brand-safe crop areas, clear hierarchy."],
      ["Mood", "Calm, intelligent, premium, confident, production-grade."],
      ["Platform Optimization", "Works as a base for OpenAI image generation, Midjourney, Flux, Runway, Kling, Veo, and Gemini with minor syntax edits."]
    ],
    build: [
      ["Architecture", `Build "${input}" as a modular product with typed shared contracts, server-only provider calls, and durable workspace memory.`],
      ["Frontend", "Next.js App Router with focused client islands for command input, mode switching, and interactive generated outputs."],
      ["Backend", "Route handlers or Edge Functions for AI proxying, quota enforcement, logging, and prompt persistence."],
      ["Database", "Supabase PostgreSQL with users, projects, prompts, versions, workflows, provider configs, favorites, and usage events."],
      ["APIs", "Use /api/forge as the orchestration endpoint and smaller provider/workflow endpoints for focused actions."],
      ["Deployment", "Vercel for web and Supabase for auth, database, and server functions."],
      ["Optimization", "Keep provider SDKs server-side, stream when possible, and cache model metadata."]
    ],
    agents: [
      ["Workflow Blocks", "Research -> structure -> generate -> review -> export."],
      ["Context Inputs", "Selected text, current page title, URL, project memory, mode, and user intent."],
      ["Automation Steps", "Run each block with explicit inputs and persist intermediate outputs for continuation."],
      ["Run Controls", "Support retry, cancel, status, logs, and save-to-project from the first workflow version."],
      ["Failure Handling", "Keep each block idempotent and return partial results when a downstream step fails."]
    ]
  };

  return core[mode].map(([title, body]) => ({ title, body }));
}

export function summarizeFallback(input: string, mode: ForgeMode): string {
  return `SenseForge structured "${input}" into a ${mode} execution package with ${sectionMap[mode].length} production-ready sections.`;
}

export function estimateUsage(input: string, output: string, mode: ForgeMode, provider: string, model: string) {
  return {
    provider,
    model,
    mode,
    inputTokens: countApproxTokens(input),
    outputTokens: countApproxTokens(output)
  };
}
