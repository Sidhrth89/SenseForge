import { AuthError } from "./auth";
import { QuotaError } from "./quota";

export function jsonError(error: unknown) {
  const status =
    error instanceof AuthError || error instanceof QuotaError
      ? error.status
      : error instanceof Error && "status" in error && typeof error.status === "number"
        ? error.status
        : 500;

  return Response.json(
    {
      error: error instanceof Error ? error.message : "Unexpected server error"
    },
    { status }
  );
}
