import { forge } from "@senseforge/ai";
import { ForgeRequestSchema } from "@senseforge/shared";
import { getApiUser } from "@/lib/server/auth";
import { allowMocks, getDefaultProvider, getProviderSecrets } from "@/lib/server/env";
import { jsonError } from "@/lib/server/http";
import { savePromptResult, recordUsage } from "@/lib/server/persistence";
import { enforceQuota } from "@/lib/server/quota";

export async function POST(request: Request) {
  try {
    const user = await getApiUser(request);
    await enforceQuota(user);

    const payload = ForgeRequestSchema.parse(await request.json());
    const result = await forge(payload, {
      secrets: getProviderSecrets(),
      allowMocks: allowMocks(),
      defaultProvider: getDefaultProvider(),
      userId: user.id
    });

    await recordUsage(result.usage, payload.context?.source ?? "web");

    const saved = payload.save
      ? await savePromptResult(user.id, payload.input, result, payload.projectId)
      : undefined;

    return Response.json({ result, saved });
  } catch (error) {
    return jsonError(error);
  }
}
