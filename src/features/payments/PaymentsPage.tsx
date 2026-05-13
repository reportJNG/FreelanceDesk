"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "../../components/common/PageHeader";
import { PaymentForm } from "../../components/forms/PaymentForm";
import { DataTable } from "../../components/tables/DataTable";
import { PaymentStatusBadge } from "../../components/common/PaymentStatusBadge";
import { LoadingState } from "../../components/common/LoadingState";
import { ErrorState } from "../../components/common/ErrorState";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { formatMoney } from "../../lib/money";
import { clientsApi } from "../clients/clientsApi";
import { projectsApi } from "../projects/projectsApi";
import { paymentsApi } from "./paymentsApi";
import type { Payment } from "./paymentsTypes";

export function PaymentsPage() {
  const queryClient = useQueryClient();
  const clients = useQuery({ queryKey: ["clients", "select"], queryFn: () => clientsApi.list({ page_size: 100 }) });
  const projects = useQuery({ queryKey: ["projects", "select"], queryFn: () => projectsApi.list({ page_size: 100 }) });
  const payments = useQuery({ queryKey: ["payments", {}], queryFn: () => paymentsApi.list() });
  const create = useMutation({ mutationFn: paymentsApi.create, onSuccess: () => { toast.success("Payment recorded"); queryClient.invalidateQueries({ queryKey: ["payments"] }); queryClient.invalidateQueries({ queryKey: ["dashboard"] }); }, onError: (error) => toast.error(error instanceof Error ? error.message : "Could not record payment") });
  const remove = useMutation({ mutationFn: paymentsApi.delete, onSuccess: () => { toast.success("Payment deleted"); queryClient.invalidateQueries({ queryKey: ["payments"] }); queryClient.invalidateQueries({ queryKey: ["dashboard"] }); }, onError: (error) => toast.error(error instanceof Error ? error.message : "Could not delete payment") });
  if (payments.isLoading) return <LoadingState />;
  if (payments.error) return <ErrorState error={payments.error} />;
  return <>
    <PageHeader title="Payments" description="Track paid, pending, failed, and refunded payments." />
    <PaymentForm clients={clients.data?.items ?? []} projects={projects.data?.items ?? []} onSubmit={(values) => create.mutate(values)} disabled={create.isPending} />
    <div className="section-gap" />
    <DataTable<Payment> items={payments.data?.items ?? []} columns={[
      { header: "Date", render: (p) => p.paid_at ?? "Not set" },
      { header: "Amount", render: (p) => <strong>{formatMoney(p.amount)}</strong> },
      { header: "Client", render: (p) => p.client_name ?? "Not set" },
      { header: "Method", render: (p) => p.method },
      { header: "Status", render: (p) => <PaymentStatusBadge value={p.status} /> },
      { header: "Actions", align: "right", render: (p) => <div className="table-actions"><ConfirmDialog label="Delete this payment?" action="Delete" onConfirm={() => remove.mutate(p.id)} /></div> },
    ]} emptyTitle="No payments recorded" emptyDescription="Record a payment to keep revenue and unpaid totals current." />
  </>;
}
