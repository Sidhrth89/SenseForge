import { createClient } from "@supabase/supabase-js";
import { allowMocks, hasSupabaseServerConfig } from "./env";

export type ApiUser = {
  id: string;
  email?: string;
  plan: "free" | "pro" | "team";
  isMock: boolean;
};

export class AuthError extends Error {
  status = 401;
}

export async function getApiUser(request: Request): Promise<ApiUser> {
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length) : undefined;

  if (hasSupabaseServerConfig() && token) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data, error } = await supabase.auth.getUser(token);

    if (!error && data.user) {
      return {
        id: data.user.id,
        email: data.user.email,
        plan: "free",
        isMock: false
      };
    }
  }

  if (allowMocks()) {
    return {
      id: "00000000-0000-4000-8000-000000000001",
      email: "demo@senseforge.local",
      plan: "free",
      isMock: true
    };
  }

  throw new AuthError("Authentication required");
}
