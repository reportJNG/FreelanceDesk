"use client";

import { Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "../../components/common/PageHeader";
import { RevenueChart } from "../../components/charts/RevenueChart";
import { ProjectStatusChart } from "../../components/charts/ProjectStatusChart";
import { MoneyCard } from "../../components/common/MoneyCard";
import { LoadingState } from "../../components/common/LoadingState";
import { ErrorState } from "../../components/common/ErrorState";
import { downloadText } from "../../lib/apiClient";
import { reportsApi } from "./reportsApi";

export function ReportsPage() {
  const revenue = useQuery({ queryKey: ["reports", "revenue"], queryFn: reportsApi.revenue });
  const unpaid = useQuery({ queryKey: ["reports", "unpaid"], queryFn: reportsApi.unpaid });
  const status = useQuery({ queryKey: ["reports", "projects-status"], queryFn: reportsApi.projectsStatus });
  if (revenue.isLoading || unpaid.isLoading || status.isLoading) return <LoadingState />;
  if (revenue.error || unpaid.error || status.error) return <ErrorState error={revenue.error ?? unpaid.error ?? status.error} />;
  async function exportJson() {
    try {
      const data = await reportsApi.exportJson();
      downloadText("freelancedesk-backup.json", JSON.stringify(data, null, 2), "application/json");
      toast.success("JSON backup downloaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Export failed");
    }
  }
  async function exportCsv(name: string) {
    try {
      const data = await reportsApi.exportCsv(name);
      downloadText(`${name}.csv`, data, "text/csv");
      toast.success(`${name}.csv downloaded`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Export failed");
    }
  }
  return <>
    <PageHeader title="Reports" description="Revenue, unpaid work, exports, and project status." />
    <section className="grid stats">
      <MoneyCard label="Expected" value={unpaid.data!.expected} />
      <MoneyCard label="Paid" value={unpaid.data!.paid} />
      <MoneyCard label="Unpaid" value={unpaid.data!.unpaid} />
    </section>
    <div className="grid chart-grid">
      <RevenueChart data={revenue.data!.monthly} />
      <ProjectStatusChart data={status.data!} />
    </div>
    <div className="card section-gap action-row">
      <button className="button" onClick={exportJson}><Download size={16} /> JSON backup</button>
      {["clients", "projects", "payments", "support-requests"].map((name) => <button key={name} className="button secondary" onClick={() => exportCsv(name)}>{name}.csv</button>)}
    </div>
  </>;
}
