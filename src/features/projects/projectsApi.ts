import { apiRequest, type ListResponse } from "../../lib/apiClient";
import type { Project } from "./projectsTypes";

export const projectsApi = {
  list: (params?: Record<string, unknown>) => apiRequest<ListResponse<Project>>("/projects", { params }),
  get: (id: string) => apiRequest<Project>(`/projects/${id}`),
  create: (body: unknown) => apiRequest<Project>("/projects", { method: "POST", body }),
  update: (id: string, body: unknown) => apiRequest<Project>(`/projects/${id}`, { method: "PATCH", body }),
  archive: (id: string) => apiRequest<Project>(`/projects/${id}`, { method: "DELETE" }),
};

