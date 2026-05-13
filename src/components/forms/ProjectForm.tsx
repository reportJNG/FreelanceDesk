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
      <section className="form-section">
        <h2 className="form-section-title">Project details</h2>
        <div className="form-grid">
          <label className="label"><span className="label-text">Client</span><select className="select" {...register("client_id")}><option value="">Select client</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
          <label className="label"><span className="label-text">Project name</span><input className="input" placeholder="Website rebuild" {...register("name")} />{errors.name?.message ? <span className="field-error">{errors.name.message}</span> : null}</label>
          <label className="label"><span className="label-text">Status</span><select className="select" {...register("status")}>{projectStatuses.map((s) => <option key={s}>{s}</option>)}</select></label>
          <label className="label"><span className="label-text">Domain</span><input className="input" placeholder="example.com" {...register("domain")} /></label>
        </div>
      </section>
      <section className="form-section">
        <h2 className="form-section-title">Links and access</h2>
        <div className="form-grid">
          <label className="label"><span className="label-text">Repository</span><input className="input" placeholder="https://github.com/..." {...register("repository_url")} /></label>
          <label className="label"><span className="label-text">Live URL</span><input className="input" placeholder="https://example.com" {...register("production_url")} /></label>
          <label className="label"><span className="label-text">Admin URL</span><input className="input" placeholder="https://example.com/admin" {...register("admin_url")} /></label>
          <label className="label"><span className="label-text">Admin username</span><input className="input" {...register("admin_username")} /></label>
          <label className="label"><span className="label-text">Password manager reference</span><input className="input" placeholder="1Password item, vault note, or reference" {...register("admin_password_note")} /></label>
        </div>
      </section>
      <section className="form-section">
        <h2 className="form-section-title">Stack and money</h2>
        <div className="form-grid">
          <label className="label"><span className="label-text">Languages</span><input className="input" placeholder="TypeScript, SQL" {...register("languagesText")} /></label>
          <label className="label"><span className="label-text">Frameworks</span><input className="input" placeholder="Next.js, Supabase" {...register("frameworksText")} /></label>
          <label className="label"><span className="label-text">Total price</span><input className="input" type="number" step="0.01" {...register("total_price")} /></label>
          <label className="label"><span className="label-text">Expenses</span><input className="input" type="number" step="0.01" {...register("expenses")} /></label>
        </div>
      </section>
      <label className="label"><span className="label-text">Description</span><textarea className="textarea" placeholder="What is included in this project?" {...register("description")} /></label>
      <label className="label"><span className="label-text">Notes</span><textarea className="textarea" placeholder="Internal notes, risks, or follow-up tasks" {...register("notes")} /></label>
      <div className="form-actions"><button className="button" disabled={disabled}>{disabled ? "Saving..." : "Save project"}</button></div>
    </form>
  );
}
