"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ProjectForm } from "../../components/forms/ProjectForm";
import { LoadingState } from "../../components/common/LoadingState";
import { ErrorState } from "../../components/common/ErrorState";
import { PageHeader } from "../../components/common/PageHeader";
import { clientsApi } from "../clients/clientsApi";
import { projectsApi } from "./projectsApi";

export function ProjectEditPage({ id }: { id: string }) {
  const queryClient = useQueryClient();
  const clients = useQuery({ queryKey: ["clients", "select"], queryFn: () => clientsApi.list({ page_size: 100 }) });
  const project = useQuery({ queryKey: ["projects", id], queryFn: () => projectsApi.get(id) });
  const mutation = useMutation({ mutationFn: (values: unknown) => projectsApi.update(id, values), onSuccess: () => { toast.success("Project updated"); queryClient.invalidateQueries({ queryKey: ["projects"] }); window.location.href = `/projects/${id}`; }, onError: (error) => toast.error(error instanceof Error ? error.message : "Could not update project") });
  if (project.isLoading) return <LoadingState />;
  if (project.error) return <ErrorState error={project.error} />;
  return <><PageHeader title="Edit Project" description="Update project scope, links, credentials references, and financials." /><ProjectForm clients={clients.data?.items ?? []} initial={project.data} onSubmit={(values) => mutation.mutate(values)} disabled={mutation.isPending} /></>;
}
