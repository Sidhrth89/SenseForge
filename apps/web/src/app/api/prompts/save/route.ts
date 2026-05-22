import { z } from "zod";
import { getApiUser } from "@/lib/server/auth";
import { jsonError } from "@/lib/server/http";
import { savePromptResult } from "@/lib/server/persistence";

const SavePromptSchema = z.object({
  input: z.string().min(1),
  projectId: z.string().uuid().optional(),
  result: z.any()
});

export async function POST(request: Request) {
  try {
    const user = await getApiUser(request);
    const payload = SavePromptSchema.parse(await request.json());
    const saved = await savePromptResult(user.id, payload.input, payload.result, payload.projectId);

    return Response.json({ saved });
  } catch (error) {
    return jsonError(error);
  }
}
