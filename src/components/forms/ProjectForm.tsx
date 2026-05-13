"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectSchema, type ProjectFormValues } from "../../features/projects/projectsSchemas";
import { projectStatuses } from "../../lib/constants";
import type { Client } from "../../features/clients/clientsTypes";
import type { Project } from "../../features/projects/projectsTypes";

export function ProjectForm({ clients, initial, onSubmit, disabled = false }: { clients: Client[]; initial?: Partial<Project>; onSubmit: (values: Record<string, unknown>) => void; disabled?: boolean }) {
  const { register, handleSubmit, formState: { errors } } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema) as Resolver<ProjectFormValues>,
    defaultValues: { client_id: initial?.client_id ?? "", name: initial?.name ?? "", status: initial?.status ?? "lead", total_price: Number(initial?.total_price ?? 0), expenses: Number(initial?.expenses ?? 0), description: initial?.description ?? "", domain: initial?.domain ?? "", repository_url: initial?.repository_url ?? "", production_url: initial?.production_url ?? "", admin_url: initial?.admin_url ?? "", admin_username: initial?.admin_username ?? "", admin_password_note: initial?.admin_password_note ?? "", languagesText: initial?.languages?.join(", ") ?? "", frameworksText: initial?.frameworks?.join(", ") ?? "", notes: initial?.notes ?? "" },
  });
  const split = (value?: string) => value?.split(",").map((item) => item.trim()).filter(Boolean) ?? [];
  return (
    <form className="card grid" onSubmit={handleSubmit((values) => onSubmit({ ...values, languages: split(values.languagesText), frameworks: split(values.frameworksText), languagesText: undefined, frameworksText: undefined }))}>
      <div className="form-grid">
        <label className="label">Client<select className="select" {...register("client_id")}><option value="">Select client</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        <label className="label">Project name<input className="input" {...register("name")} />{errors.name?.message ? <span className="field-error">{errors.name.message}</span> : null}</label>
        <label className="label">Status<select className="select" {...register("status")}>{projectStatuses.map((s) => <option key={s}>{s}</option>)}</select></label>
        <label className="label">Domain<input className="input" {...register("domain")} /></label>
        <label className="label">Repository<input className="input" {...register("repository_url")} /></label>
        <label className="label">Live URL<input className="input" {...register("production_url")} /></label>
        <label className="label">Admin URL<input className="input" {...register("admin_url")} /></label>
        <label className="label">Admin username<input className="input" {...register("admin_username")} /></label>
        <label className="label">Password manager reference<input className="input" {...register("admin_password_note")} /></label>
        <label className="label">Languages<input className="input" {...register("languagesText")} /></label>
        <label className="label">Frameworks<input className="input" {...register("frameworksText")} /></label>
        <label className="label">Total price<input className="input" type="number" step="0.01" {...register("total_price")} /></label>
        <label className="label">Expenses<input className="input" type="number" step="0.01" {...register("expenses")} /></label>
      </div>
      <label className="label">Description<textarea className="textarea" {...register("description")} /></label>
      <label className="label">Notes<textarea className="textarea" {...register("notes")} /></label>
      <div className="form-actions"><button className="button" disabled={disabled}>{disabled ? "Saving..." : "Save project"}</button></div>
    </form>
  );
}
