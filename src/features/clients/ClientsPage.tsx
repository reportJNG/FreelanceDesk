"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DataTable } from "../../components/tables/DataTable";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { LoadingState } from "../../components/common/LoadingState";
import { PageHeader } from "../../components/common/PageHeader";
import { StatusBadge } from "../../components/common/StatusBadge";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { clientsApi } from "./clientsApi";
import type { Client } from "./clientsTypes";

export function ClientsPage() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["clients", {}], queryFn: () => clientsApi.list() });
  const archive = useMutation({ mutationFn: clientsApi.archive, onSuccess: () => { toast.success("Client archived"); queryClient.invalidateQueries({ queryKey: ["clients"] }); }, onError: (error) => toast.error(error instanceof Error ? error.message : "Could not archive client") });
  if (query.isLoading) return <LoadingState />;
  if (query.error) return <ErrorState error={query.error} />;
  const items = query.data?.items ?? [];
  return (
    <>
      <PageHeader title="Clients" description="Manage client profiles, contact details, and work history." action={<Link className="button" href="/clients/new"><Plus size={16} /> Add Client</Link>} />
      {items.length === 0 ? <EmptyState title="No clients yet" description="Create a client profile before adding projects or payments." action={<Link className="button" href="/clients/new">Add your first client</Link>} /> : (
        <DataTable<Client> items={items} columns={[
          { header: "Name", render: (c) => <><strong>{c.name}</strong><div className="muted">{c.company_name || "Independent client"}</div></> },
          { header: "Contact", render: (c) => <><div>{c.email}</div><div className="muted">{c.phone}</div></> },
          { header: "Work", render: (c) => <><strong>{c.projects_count ?? 0}</strong><div className="muted">projects</div></> },
          { header: "Status", render: (c) => <StatusBadge value={c.status} /> },
          { header: "Created", render: (c) => new Date(c.created_at).toLocaleDateString() },
          { header: "Actions", align: "right", render: (c) => <div className="table-actions"><Link className="button small secondary" href={`/clients/${c.id}/edit`}>Edit</Link><ConfirmDialog label="Archive this client?" onConfirm={() => archive.mutate(c.id)} /></div> },
        ]} rowHref={(client) => `/clients/${client.id}`} />
      )}
    </>
  );
}
