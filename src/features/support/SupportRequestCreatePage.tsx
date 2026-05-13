"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "../../components/common/PageHeader";
import { SupportRequestForm } from "../../components/forms/SupportRequestForm";
import { clientsApi } from "../clients/clientsApi";
import { projectsApi } from "../projects/projectsApi";
import { supportApi } from "./supportApi";

export function SupportRequestCreatePage() {
  const queryClient = useQueryClient();
  const clients = useQuery({ queryKey: ["clients", "select"], queryFn: () => clientsApi.list({ page_size: 100 }) });
  const projects = useQuery({ queryKey: ["projects", "select"], queryFn: () => projectsApi.list({ page_size: 100 }) });
  const mutation = useMutation({ mutationFn: supportApi.create, onSuccess: () => { toast.success("Support request created"); queryClient.invalidateQueries({ queryKey: ["support-requests"] }); window.location.href = "/fixes"; }, onError: (error) => toast.error(error instanceof Error ? error.message : "Could not save request") });
  return <><PageHeader title="New Support Request" description="Capture a client fix, maintenance task, or small follow-up request." /><SupportRequestForm clients={clients.data?.items ?? []} projects={projects.data?.items ?? []} onSubmit={(values) => mutation.mutate(values)} disabled={mutation.isPending} /></>;
}
