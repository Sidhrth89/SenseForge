import { getApiUser } from "@/lib/server/auth";
import { jsonError } from "@/lib/server/http";
import { listPromptHistory } from "@/lib/server/persistence";

export async function GET(request: Request) {
  try {
    const user = await getApiUser(request);
    const prompts = await listPromptHistory(user.id);

    return Response.json({ prompts });
  } catch (error) {
    return jsonError(error);
  }
}
