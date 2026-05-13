import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import { ApiError } from "./errors";

export type ServerContext = {
  client: SupabaseClient;
  userId: string;
};

function env(name: string) {
  return process.env[name]?.trim() ?? "";
}

function getSupabaseConfig() {
  const url = env("SUPABASE_URL") || env("NEXT_PUBLIC_SUPABASE_URL") || env("VITE_SUPABASE_URL");
  const anonKey = env("SUPABASE_ANON_KEY") || env("NEXT_PUBLIC_SUPABASE_ANON_KEY") || env("VITE_SUPABASE_ANON_KEY");
  if (!url || !anonKey) throw new ApiError(500, "Supabase authentication is not configured");
  return { url, anonKey };
}

function getBearerToken(request: NextRequest) {
  const header = request.headers.get("authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match?.[1]) throw new ApiError(401, "Authentication required");
  return match[1];
}

export async function getServerContext(request: NextRequest): Promise<ServerContext> {
  const token = getBearerToken(request);
  const { url, anonKey } = getSupabaseConfig();
  const client = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user?.id) throw new ApiError(401, "Invalid or expired token");
  return { client, userId: data.user.id };
}
