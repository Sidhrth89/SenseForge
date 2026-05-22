import type { ApiUser } from "./auth";
import { getDailyFreeLimit } from "./env";
import { recentUsageForUser } from "./persistence";

export class QuotaError extends Error {
  status = 429;
}

export async function enforceQuota(user: ApiUser) {
  if (user.plan !== "free") {
    return;
  }

  const usage = recentUsageForUser(user.id);

  if (usage.length >= getDailyFreeLimit()) {
    throw new QuotaError("Daily free generation limit reached");
  }
}
