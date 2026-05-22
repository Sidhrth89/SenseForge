import { ForgeRequestSchema } from "@senseforge/shared";
import { forge } from "@senseforge/ai";
import { getApiUser } from "@/lib/server/auth";
import { allowMocks, getDefaultProvider, getProviderSecrets } from "@/lib/server/env";
import { jsonError } from "@/lib/server/http";
import { enforceQuota } from "@/lib/server/quota";

const encoder = new TextEncoder();

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

    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "result", result })}\n\n`));
        controller.enqueue(encoder.encode("data: {\"type\":\"done\"}\n\n"));
        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache"
      }
    });
  } catch (error) {
    return jsonError(error);
  }
}
