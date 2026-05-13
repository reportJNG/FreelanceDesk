import { apiRequest } from "../../lib/apiClient";
import type { ReminderGroups } from "./remindersTypes";

export const remindersApi = {
  list: () => apiRequest<ReminderGroups>("/reminders"),
};

