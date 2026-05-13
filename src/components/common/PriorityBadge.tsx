import { StatusBadge } from "./StatusBadge";

export function PriorityBadge({ value }: { value?: string | null }) {
  return <StatusBadge value={value} />;
}

