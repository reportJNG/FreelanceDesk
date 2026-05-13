import { Wallet } from "lucide-react";
import { formatMoney } from "../../lib/money";
import { StatCard } from "./StatCard";

export function MoneyCard({ label, value, currency = "DZD" }: { label: string; value: number; currency?: string }) {
  return <StatCard label={label} value={formatMoney(value, currency)} subtitle="Calculated from paid records" icon={Wallet} />;
}

