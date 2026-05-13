import { z } from "zod";

export const projectSchema = z.object({
  client_id: z.string().min(1, "Client is required"),
  name: z.string().min(1, "Project name is required"),
  status: z.string().default("lead"),
  description: z.string().optional(),
  domain: z.string().optional(),
  repository_url: z.string().optional(),
  production_url: z.string().optional(),
  admin_url: z.string().optional(),
  admin_username: z.string().optional(),
  admin_password_note: z.string().optional(),
  languagesText: z.string().optional(),
  frameworksText: z.string().optional(),
  test_start_date: z.string().optional(),
  test_end_date: z.string().optional(),
  domain_renewal_date: z.string().optional(),
  hosting_renewal_date: z.string().optional(),
  maintenance_end_date: z.string().optional(),
  total_price: z.coerce.number().min(0),
  expenses: z.coerce.number().min(0),
  notes: z.string().optional(),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;

