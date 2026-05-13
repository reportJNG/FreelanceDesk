import { apiRequest } from "../../lib/apiClient";

export type AppSettings = {
  id: string;
  theme: "system" | "light" | "dark";
  currency: string;
  reminder_days_before: number;
};

export const settingsApi = {
  get: () => apiRequest<AppSettings>("/settings"),
  update: (body: unknown) => apiRequest<AppSettings>("/settings", { method: "PATCH", body }),
};

