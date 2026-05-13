import { StatusBadge } from "./StatusBadge";

export function PaymentStatusBadge({ value }: { value?: string | null }) {
  return <StatusBadge value={value} />;
}

