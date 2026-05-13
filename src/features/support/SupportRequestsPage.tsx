"use client";

import { Plus } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "../../components/common/PageHeader";
import { DataTable } from "../../components/tables/DataTable";
import { PriorityBadge } from "../../components/common/PriorityBadge";
import { StatusBadge } from "../../components/common/StatusBadge";
import { LoadingState } from "../../components/common/LoadingState";
import { ErrorState } from "../../components/common/ErrorState";
import { EmptyState } from "../../components/common/EmptyState";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { formatMoney } from "../../lib/money";
import { supportApi } from "./supportApi";
import type { SupportRequest } from "./supportTypes";

export function SupportRequestsPage() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["support-requests", {}], queryFn: () => supportApi.list() });
  const remove = useMutation({ mutationFn: supportApi.delete, onSuccess: () => { toast.success("Support request deleted"); queryClient.invalidateQueries({ queryKey: ["support-requests"] }); }, onError: (error) => toast.error(error instanceof Error ? error.message : "Could not delete request") });
  if (query.isLoading) return <LoadingState />;
  if (query.error) return <ErrorState error={query.error} />;
  const items = query.data?.items ?? [];
  return <>
    <PageHeader title="Fixes / Support" action={<a className="button" href="/fixes/new"><Plus size={16} /> New Request</a>} />
    {items.length === 0 ? <EmptyState title="No support requests" action={<a className="button" href="/fixes/new">Create request</a>} /> : <DataTable<SupportRequest> items={items} columns={[
      { header: "Title", render: (r) => <strong>{r.title}</strong> },
      { header: "Type", render: (r) => r.request_type },
      { header: "Priority", render: (r) => <PriorityBadge value={r.priority} /> },
      { header: "Status", render: (r) => <StatusBadge value={r.status} /> },
      { header: "Price", render: (r) => <><strong>{formatMoney(r.price)}</strong><div className="muted">{formatMoney(r.remaining_amount ?? 0)} left</div></> },
      { header: "Due", render: (r) => r.due_date ?? "Not set" },
      { header: "Actions", render: (r) => <div className="table-actions"><ConfirmDialog label="Delete this support request?" action="Delete" onConfirm={() => remove.mutate(r.id)} /></div> },
    ]} />}
  </>;
}
