import { apiRequest } from "../../lib/apiClient";
import type { DashboardSummary } from "./dashboardTypes";

export const dashboardApi = {
  summary: () => apiRequest<DashboardSummary>("/dashboard/summary"),
};

