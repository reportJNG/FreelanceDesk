import { titleize } from "../../lib/format";

const colors: Record<string, string> = {
  lead: "#64748b",
  active: "#2563eb",
  testing: "#f59e0b",
  delivered: "#10b981",
  maintenance: "#7c3aed",
  cancelled: "#ef4444",
  archived: "#6b7280",
  done: "#10b981",
  paid: "#10b981",
  pending: "#f59e0b",
  failed: "#ef4444",
  refunded: "#7c3aed",
};

export function StatusBadge({ value }: { value?: string | null }) {
  const color = colors[value ?? ""] ?? "#64748b";
  return <span className="badge" style={{ color, borderColor: color }}>{titleize(value)}</span>;
}

