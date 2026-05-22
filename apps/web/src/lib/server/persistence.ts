import { createClient } from "@supabase/supabase-js";
import type { AgentRun, ForgeResult, UsageEvent } from "@senseforge/shared";
import { hasSupabaseServerConfig } from "./env";

type StoredPrompt = {
  id: string;
  title: string;
  mode: string;
  input: string;
  createdAt: string;
};

const memory = {
  prompts: [] as StoredPrompt[],
  usage: [] as UsageEvent[],
  runs: [] as AgentRun[]
};

function serviceClient() {
  if (!hasSupabaseServerConfig()) {
    return null;
  }

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      persistSession: false
    }
  });
}

export async function recordUsage(usage: UsageEvent, source = "web") {
  const supabase = serviceClient();
  memory.usage.unshift(usage);

  if (!supabase) {
    return;
  }

  await supabase.from("usage_events").insert({
    user_id: usage.userId,
    provider: usage.provider,
    model: usage.model,
    mode: usage.mode,
    input_tokens: usage.inputTokens,
    output_tokens: usage.outputTokens,
    cost_usd: usage.costUsd,
    source
  });
}

export async function savePromptResult(userId: string, input: string, result: ForgeResult, projectId?: string) {
  const supabase = serviceClient();

  if (!supabase) {
    const item = {
      id: result.id,
      title: result.title,
      mode: result.mode,
      input,
      createdAt: result.createdAt
    };
    memory.prompts.unshift(item);
    return item;
  }

  const { data: prompt, error: promptError } = await supabase
    .from("prompts")
    .insert({
      user_id: userId,
      project_id: projectId,
      mode: result.mode,
      title: result.title,
      input
    })
    .select("id,title,mode,input,created_at")
    .single();

  if (promptError) {
    throw promptError;
  }

  const { data: version, error: versionError } = await supabase
    .from("prompt_versions")
    .insert({
      prompt_id: prompt.id,
      version: 1,
      input,
      output: result
    })
    .select("id")
    .single();

  if (versionError) {
    throw versionError;
  }

  await supabase.from("prompts").update({ current_version_id: version.id }).eq("id", prompt.id);

  return {
    id: prompt.id as string,
    title: prompt.title as string,
    mode: prompt.mode as string,
    input: prompt.input as string,
    createdAt: prompt.created_at as string
  };
}

export async function listPromptHistory(userId: string) {
  const supabase = serviceClient();

  if (!supabase) {
    return memory.prompts.slice(0, 30);
  }

  const { data, error } = await supabase
    .from("prompts")
    .select("id,title,mode,input,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    throw error;
  }

  return data.map((item) => ({
    id: item.id as string,
    title: item.title as string,
    mode: item.mode as string,
    input: item.input as string,
    createdAt: item.created_at as string
  }));
}

export async function saveAgentRun(run: AgentRun) {
  const supabase = serviceClient();
  memory.runs.unshift(run);

  if (!supabase) {
    return run;
  }

  await supabase.from("agent_runs").insert({
    id: run.id,
    user_id: run.userId,
    workflow_id: run.workflowId,
    status: run.status,
    input: run.input,
    output: run.output,
    logs: run.logs
  });

  return run;
}

export function recentUsageForUser(userId: string) {
  return memory.usage.filter((event) => event.userId === userId);
}
