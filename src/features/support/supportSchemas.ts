import { z } from "zod";

export const supportRequestSchema = z.object({
  client_id: z.string().min(1, "Client is required"),
  project_id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  request_type: z.string().default("other"),
  priority: z.string().default("medium"),
  status: z.string().default("new"),
  price: z.coerce.number().min(0),
  requested_at: z.string().optional(),
  due_date: z.string().optional(),
  completed_at: z.string().optional(),
  notes: z.string().optional(),
});

export type SupportRequestFormValues = z.infer<typeof supportRequestSchema>;

