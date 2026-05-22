import { listModels } from "@senseforge/ai";
import { getProviderSecrets } from "@/lib/server/env";

export async function GET() {
  return Response.json({
    models: listModels(getProviderSecrets())
  });
}
