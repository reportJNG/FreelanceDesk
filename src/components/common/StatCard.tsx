import type { LucideIcon } from "lucide-react";

export function StatCard({ label, value, subtitle, icon: Icon }: { label: string; value: string | number; subtitle?: string; icon: LucideIcon }) {
  return (
    <div className="card">
      <div className="stat-card">
        <div>
          <div className="stat-label">{label}</div>
          <div className="stat-value">{value}</div>
          {subtitle ? <div className="subtle">{subtitle}</div> : null}
        </div>
        <span className="stat-icon"><Icon size={22} /></span>
      </div>
    </div>
  );
}
