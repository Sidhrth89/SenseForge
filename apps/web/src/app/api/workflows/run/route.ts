import { z } from "zod";
import { forge } from "@senseforge/ai";
import { type AgentRun } from "@senseforge/shared";
import { getApiUser } from "@/lib/server/auth";
import { allowMocks, getDefaultProvider, getProviderSecrets } from "@/lib/server/env";
import { jsonError } from "@/lib/server/http";
import { saveAgentRun } from "@/lib/server/persistence";
import { enforceQuota } from "@/lib/server/quota";

const WorkflowRunSchema = z.object({
  input: z.string().min(1),
  workflowId: z.string().uuid().optional(),
  blocks: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        mode: z.enum(["think", "create", "build", "agents"]),
        inputTemplate: z.string()
      })
    )
    .default([
      { id: "research", label: "Research", mode: "think", inputTemplate: "Research and structure: {{input}}" },
      { id: "copy", label: "Copywriting", mode: "create", inputTemplate: "Create campaign copy and prompts from: {{input}}" },
      { id: "export", label: "Export Plan", mode: "agents", inputTemplate: "Create workflow export steps for: {{input}}" }
    ])
});

export async function POST(request: Request) {
  try {
    const user = await getApiUser(request);
    await enforceQuota(user);

    const payload = WorkflowRunSchema.parse(await request.json());
    const logs: string[] = [];
    const outputs = [];

    for (const block of payload.blocks) {
      logs.push(`Running ${block.label}`);
      const result = await forge(
        {
          input: block.inputTemplate.replaceAll("{{input}}", payload.input),
          mode: block.mode,
          save: false,
          context: { source: "extension" }
        },
        {
          secrets: getProviderSecrets(),
          allowMocks: allowMocks(),
          defaultProvider: getDefaultProvider(),
          userId: user.id
        }
      );
      outputs.push(result);
      logs.push(`Completed ${block.label}`);
    }

    const run: AgentRun = {
      id: crypto.randomUUID(),
      workflowId: payload.workflowId,
      userId: user.id,
      status: "succeeded",
      input: payload.input,
      output: outputs,
      logs,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await saveAgentRun(run);
    return Response.json({ run });
  } catch (error) {
    return jsonError(error);
  }
}
