import { API_URL } from "./constants";
import { supabase } from "./supabaseClient";

export type ListResponse<T> = {
  items: T[];
  total: number;
  page: number;
  page_size: number;
};

type RequestOptions = {
  method?: string;
  body?: unknown;
  params?: Record<string, unknown>;
};

function buildApiUrl(path: string): URL {
  const base = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(`${base}${normalizedPath}`, window.location.origin);
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const url = buildApiUrl(path);
  Object.entries(options.params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  });
  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (response.status === 401) {
    await supabase.auth.signOut();
    window.location.href = "/login";
    throw new Error("Session expired");
  }
  if (!response.ok) {
    const contentType = response.headers.get("content-type") ?? "";
    const fallback = `Request failed with status ${response.status}`;
    if (contentType.includes("application/json")) {
      const error = await response.json().catch(() => ({ detail: fallback }));
      throw new Error(error.detail ?? error.message ?? fallback);
    }
    const text = await response.text().catch(() => "");
    throw new Error(text || fallback);
  }
  if (response.headers.get("content-type")?.includes("text/csv")) return (await response.text()) as T;
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function downloadText(filename: string, text: string, type = "text/plain") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
