import type { ContextPayload, ForgeResult } from "@senseforge/shared";

export type StoredContext = ContextPayload & {
  capturedAt: string;
};

export type ForgeResponse = {
  result: ForgeResult;
  saved?: unknown;
};
