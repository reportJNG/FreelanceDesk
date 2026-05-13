"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Client } from "../../features/clients/clientsTypes";
import type { Project } from "../../features/projects/projectsTypes";
import { priorities, supportStatuses, supportTypes } from "../../lib/constants";
import { supportRequestSchema, type SupportRequestFormValues } from "../../features/support/supportSchemas";

export function SupportRequestForm({ clients, projects, onSubmit, disabled = false }: { clients: Client[]; projects: Project[]; onSubmit: (values: Record<string, unknown>) => void; disabled?: boolean }) {
  const { register, handleSubmit } = useForm<SupportRequestFormValues>({ resolver: zodResolver(supportRequestSchema) as Resolver<SupportRequestFormValues>, defaultValues: { request_type: "other", priority: "medium", status: "new", price: 0 } });
  return (
    <form className="card grid" onSubmit={handleSubmit((values) => onSubmit({ ...values, project_id: values.project_id || null }))}>
      <div className="form-grid">
        <label className="label">Client<select className="select" {...register("client_id")}><option value="">Select client</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        <label className="label">Project<select className="select" {...register("project_id")}><option value="">Optional</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
        <label className="label">Title<input className="input" {...register("title")} /></label>
        <label className="label">Type<select className="select" {...register("request_type")}>{supportTypes.map((s) => <option key={s}>{s}</option>)}</select></label>
        <label className="label">Priority<select className="select" {...register("priority")}>{priorities.map((s) => <option key={s}>{s}</option>)}</select></label>
        <label className="label">Status<select className="select" {...register("status")}>{supportStatuses.map((s) => <option key={s}>{s}</option>)}</select></label>
        <label className="label">Price<input className="input" type="number" step="0.01" {...register("price")} /></label>
        <label className="label">Due date<input className="input" type="date" {...register("due_date")} /></label>
      </div>
      <label className="label">Description<textarea className="textarea" {...register("description")} /></label>
      <label className="label">Notes<textarea className="textarea" {...register("notes")} /></label>
      <div className="form-actions"><button className="button" disabled={disabled}>{disabled ? "Saving..." : "Save request"}</button></div>
    </form>
  );
}
