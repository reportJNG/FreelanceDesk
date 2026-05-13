"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ProjectForm } from "../../components/forms/ProjectForm";
import { PageHeader } from "../../components/common/PageHeader";
import { clientsApi } from "../clients/clientsApi";
import { projectsApi } from "./projectsApi";

export function ProjectCreatePage() {
  const queryClient = useQueryClient();
  const clients = useQuery({ queryKey: ["clients", "select"], queryFn: () => clientsApi.list({ page_size: 100 }) });
  const mutation = useMutation({ mutationFn: projectsApi.create, onSuccess: (project) => { toast.success("Project created"); queryClient.invalidateQueries({ queryKey: ["projects"] }); window.location.href = `/projects/${project.id}`; }, onError: (error) => toast.error(error instanceof Error ? error.message : "Could not create project") });
  return <><PageHeader title="New Project" /><ProjectForm clients={clients.data?.items ?? []} onSubmit={(values) => mutation.mutate(values)} disabled={mutation.isPending} /></>;
}
