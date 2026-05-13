"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "../../components/common/PageHeader";
import { DataTable } from "../../components/tables/DataTable";
import { StatusBadge } from "../../components/common/StatusBadge";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { EmptyState } from "../../components/common/EmptyState";
import { LoadingState } from "../../components/common/LoadingState";
import { ErrorState } from "../../components/common/ErrorState";
import { formatMoney } from "../../lib/money";
import { projectsApi } from "./projectsApi";
import type { Project } from "./projectsTypes";

export function ProjectsPage() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["projects", {}], queryFn: () => projectsApi.list() });
  const archive = useMutation({ mutationFn: projectsApi.archive, onSuccess: () => { toast.success("Project archived"); queryClient.invalidateQueries({ queryKey: ["projects"] }); }, onError: (error) => toast.error(error instanceof Error ? error.message : "Could not archive project") });
  if (query.isLoading) return <LoadingState />;
  if (query.error) return <ErrorState error={query.error} />;
  const items = query.data?.items ?? [];
  return <>
    <PageHeader title="Projects" description="Track scope, stack, status, credentials, and project financials." action={<Link className="button" href="/projects/new"><Plus size={16} /> Add Project</Link>} />
    {items.length === 0 ? <EmptyState title="No projects yet" description="Create a project once a client has active work." action={<Link className="button" href="/projects/new">Create project</Link>} /> : (
      <DataTable<Project> items={items} columns={[
        { header: "Project", render: (p) => <><strong>{p.name}</strong><div className="muted">{p.domain || "No domain"}</div></> },
        { header: "Status", render: (p) => <StatusBadge value={p.status} /> },
        { header: "Stack", render: (p) => [...(p.languages ?? []), ...(p.frameworks ?? [])].join(", ") || "Not set" },
        { header: "Total", render: (p) => <><strong>{formatMoney(p.total_price)}</strong><div className="muted">{formatMoney(p.remaining_amount ?? 0)} left</div></> },
        { header: "Test End", render: (p) => p.test_end_date ?? "Not set" },
        { header: "Actions", align: "right", render: (p) => <div className="table-actions"><Link className="button small secondary" href={`/projects/${p.id}/edit`}>Edit</Link><ConfirmDialog label="Archive this project?" onConfirm={() => archive.mutate(p.id)} /></div> },
      ]} rowHref={(project) => `/projects/${project.id}`} />
    )}
  </>;
}
