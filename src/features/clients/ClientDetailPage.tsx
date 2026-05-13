"use client";

import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "../../components/common/PageHeader";
import { LoadingState } from "../../components/common/LoadingState";
import { ErrorState } from "../../components/common/ErrorState";
import { StatusBadge } from "../../components/common/StatusBadge";
import { formatMoney } from "../../lib/money";
import { clientsApi } from "./clientsApi";

export function ClientDetailPage({ id }: { id: string }) {
  const query = useQuery({ queryKey: ["clients", id], queryFn: () => clientsApi.get(id) });
  if (query.isLoading) return <LoadingState />;
  if (query.error) return <ErrorState error={query.error} />;
  const client = query.data!;
  return (
    <>
      <PageHeader title={client.name} action={<a className="button" href={`/clients/${id}/edit`}>Edit client</a>} />
      <div className="grid detail-grid">
        <div className="card"><h3>Contact</h3><div className="info-list"><div>{client.email || "No email"}</div><div className="muted">{client.phone || "No phone"}</div><div className="muted">{client.whatsapp || "No WhatsApp"}</div></div></div>
        <div className="card"><h3>Profile</h3><div className="info-list"><StatusBadge value={client.status} /><div>{client.company_name || "No company"}</div><div className="muted">{client.website || "No website"}</div></div></div>
        <div className="card"><h3>Money</h3><div className="info-row"><span>Paid</span><strong>{formatMoney(client.total_paid ?? 0)}</strong></div><div className="info-row"><span>Remaining</span><strong>{formatMoney(client.remaining ?? 0)}</strong></div></div>
        <div className="card"><h3>Notes</h3><p className="muted">{client.notes || "No notes"}</p></div>
      </div>
    </>
  );
}
