import { ContextPayloadSchema } from "@senseforge/shared";
import { getApiUser } from "@/lib/server/auth";
import { jsonError } from "@/lib/server/http";

export async function POST(request: Request) {
  try {
    const user = await getApiUser(request);
    const context = ContextPayloadSchema.parse(await request.json());

    return Response.json({
      userId: user.id,
      context,
      suggestions: [
        "Enhance selected text",
        "Summarize this page",
        "Generate a creative prompt",
        "Build a campaign workflow"
      ]
    });
  } catch (error) {
    return jsonError(error);
  }
}
