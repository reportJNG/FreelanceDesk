import { ApiError } from "./errors";

export type Pagination = { page: number; pageSize: number; start: number; end: number };

export function getPagination(pageParam: string | null, pageSizeParam: string | null): Pagination {
  const page = Math.max(Number(pageParam ?? 1) || 1, 1);
  const pageSize = Math.min(Math.max(Number(pageSizeParam ?? 20) || 20, 1), 100);
  const start = (page - 1) * pageSize;
  return { page, pageSize, start, end: start + pageSize - 1 };
}

export function listResponse<T>(items: T[], total: number | null, page: number, pageSize: number) {
  return { items, total: total ?? 0, page, page_size: pageSize };
}

export function cleanPayload<T extends Record<string, unknown>>(payload: T) {
  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== null && value !== undefined));
}

export function ensureFirst<T>(rows: T[] | null, status = 404, detail = "Record not found"): T {
  if (!rows?.length) throw new ApiError(status, detail);
  return rows[0];
}

export function ensureWritten<T>(rows: T[] | null): T {
  if (!rows?.length) throw new ApiError(502, "Database write returned no data");
  return rows[0];
}

export function uniqueValues(rows: Record<string, unknown>[], key: string) {
  return [...new Set(rows.map((row) => row[key]).filter(Boolean).map(String))].sort();
}

export function rowsById<T extends Record<string, unknown>>(rows: T[], key = "id") {
  return Object.fromEntries(rows.filter((row) => row[key]).map((row) => [String(row[key]), row]));
}

export function money(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function nowIso() {
  return new Date().toISOString();
}

export function withinDays(value: unknown, days: number) {
  if (!value) return false;
  const date = new Date(String(value).slice(0, 10));
  if (Number.isNaN(date.getTime())) return false;
  const today = new Date(todayIso());
  const end = new Date(today);
  end.setDate(end.getDate() + days);
  return date >= today && date <= end;
}

export function beforeToday(value: unknown) {
  if (!value) return false;
  const date = new Date(String(value).slice(0, 10));
  return !Number.isNaN(date.getTime()) && date < new Date(todayIso());
}

export function rowsToCsv(rows: Record<string, unknown>[], fieldnames: string[]) {
  const escape = (value: unknown) => {
    if (value === null || value === undefined) return "";
    const text = Array.isArray(value) || typeof value === "object" ? JSON.stringify(value) : String(value);
    return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
  };
  return [fieldnames.join(","), ...rows.map((row) => fieldnames.map((field) => escape(row[field])).join(","))].join("\r\n");
}

export async function execQuery<T>(query: PromiseLike<{ data: unknown; count: number | null; error: { message: string } | null }>) {
  const { data, count, error } = await query;
  if (error) throw new ApiError(502, "Database request failed");
  return { data: (data ?? []) as T[], count };
}
