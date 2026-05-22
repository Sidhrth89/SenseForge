import { z } from "zod";
import { createProviders, resolveModel, resolveProvider } from "@senseforge/ai";
import { AIProviderIdSchema } from "@senseforge/shared";
import { getApiUser } from "@/lib/server/auth";
import { getDefaultProvider, getProviderSecrets } from "@/lib/server/env";
import { jsonError } from "@/lib/server/http";
import { enforceQuota } from "@/lib/server/quota";

const GenerateSchema = z.object({
  provider: AIProviderIdSchema.optional(),
  model: z.string().optional(),
  system: z.string().optional(),
  prompt: z.string().min(1),
  mode: z.enum(["think", "create", "build", "agents"]).default("think")
});

export async function POST(request: Request) {
  try {
    const user = await getApiUser(request);
    await enforceQuota(user);

    const payload = GenerateSchema.parse(await request.json());
    const provider = resolveProvider(createProviders(getProviderSecrets()), payload.provider, getDefaultProvider());
    const model = resolveModel(provider, payload.mode, payload.model);
    const text = await provider.generate(
      [
        { role: "system", content: payload.system ?? "You are SenseForge. Return structured production-grade output." },
        { role: "user", content: payload.prompt }
      ],
      model
    );

    return Response.json({ provider: provider.id, model, text, userId: user.id });
  } catch (error) {
    return jsonError(error);
  }
}
