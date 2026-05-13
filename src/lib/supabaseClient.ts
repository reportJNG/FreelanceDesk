import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? "").trim();
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY ?? "").trim();

export const isSupabaseConfigured =
  Boolean(supabaseUrl) &&
  Boolean(supabaseAnonKey) &&
  !supabaseUrl.includes("your-project") &&
  supabaseAnonKey !== "your-anon-key";

export const missingSupabaseMessage =
  "Supabase is not configured yet. Create frontend/.env.local from .env.example and set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.";

export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : "http://localhost:54321",
  isSupabaseConfigured ? supabaseAnonKey : "missing-anon-key",
);
