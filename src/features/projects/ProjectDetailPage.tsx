"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "../../components/common/PageHeader";
import { LoadingState } from "../../components/common/LoadingState";
import { ErrorState } from "../../components/common/ErrorState";
import { StatusBadge } from "../../components/common/StatusBadge";
import { RevealSensitiveField } from "../../components/common/RevealSensitiveField";
import { CopyButton } from "../../components/common/CopyButton";
import { formatMoney } from "../../lib/money";
import { projectsApi } from "./projectsApi";

export function ProjectDetailPage({ id }: { id: string }) {
  const query = useQuery({ queryKey: ["projects", id], queryFn: () => projectsApi.get(id) });
  if (query.isLoading) return <LoadingState />;
  if (query.error) return <ErrorState error={query.error} />;
  const project = query.data!;
  return <>
    <PageHeader title={project.name} description={project.domain || "Project detail"} action={<Link className="button" href={`/projects/${id}/edit`}>Edit project</Link>} />
    <div className="grid detail-grid">
      <div className="card"><h3 className="card-title">Status</h3><StatusBadge value={project.status} /><p className="muted">{project.description || "No description"}</p></div>
      <div className="card"><h3 className="card-title">Financials</h3><div className="info-row"><span>Total</span><strong>{formatMoney(project.total_price)}</strong></div><div className="info-row"><span>Paid</span><strong>{formatMoney(project.paid_amount ?? 0)}</strong></div><div className="info-row"><span>Remaining</span><strong>{formatMoney(project.remaining_amount ?? 0)}</strong></div><div className="info-row"><span>Expenses</span><strong>{formatMoney(project.expenses)}</strong></div></div>
      <div className="card"><h3 className="card-title">Links</h3><p className="code-value">{project.production_url || "No live URL"}</p><CopyButton value={project.production_url} /></div>
      <RevealSensitiveField label="Admin username" value={project.admin_username} />
      <RevealSensitiveField label="Password manager reference" value={project.admin_password_note} />
      <div className="card"><h3 className="card-title">Notes</h3><p className="muted">{project.notes || "No notes"}</p></div>
    </div>
  </>;
}
