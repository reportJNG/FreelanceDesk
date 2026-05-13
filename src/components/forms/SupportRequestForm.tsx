"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Client } from "../../features/clients/clientsTypes";
import type { Project } from "../../features/projects/projectsTypes";
import { priorities, supportStatuses, supportTypes } from "../../lib/constants";
import { supportRequestSchema, type SupportRequestFormValues } from "../../features/support/supportSchemas";

export function SupportRequestForm({ clients, projects, onSubmit, disabled = false }: { clients: Client[]; projects: Project[]; onSubmit: (values: Record<string, unknown>) => void; disabled?: boolean }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SupportRequestFormValues>({ resolver: zodResolver(supportRequestSchema) as Resolver<SupportRequestFormValues>, defaultValues: { request_type: "other", priority: "medium", status: "new", price: 0 } });
  return (
    <form className="card grid" onSubmit={handleSubmit((values) => onSubmit({ ...values, project_id: values.project_id || null }))}>
      <div className="form-section">
        <h2 className="form-section-title">Request details</h2>
        <div className="form-grid">
          <label className="label"><span className="label-text">Client</span><select className="select" {...register("client_id")}><option value="">Select client</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>{errors.client_id?.message ? <span className="field-error">{errors.client_id.message}</span> : null}</label>
          <label className="label"><span className="label-text">Project</span><select className="select" {...register("project_id")}><option value="">Optional</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
          <label className="label"><span className="label-text">Title</span><input className="input" placeholder="Fix checkout issue" {...register("title")} />{errors.title?.message ? <span className="field-error">{errors.title.message}</span> : null}</label>
          <label className="label"><span className="label-text">Type</span><select className="select" {...register("request_type")}>{supportTypes.map((s) => <option key={s}>{s}</option>)}</select></label>
          <label className="label"><span className="label-text">Priority</span><select className="select" {...register("priority")}>{priorities.map((s) => <option key={s}>{s}</option>)}</select></label>
          <label className="label"><span className="label-text">Status</span><select className="select" {...register("status")}>{supportStatuses.map((s) => <option key={s}>{s}</option>)}</select></label>
          <label className="label"><span className="label-text">Price</span><input className="input" type="number" min="0" step="0.01" {...register("price")} /></label>
          <label className="label"><span className="label-text">Due date</span><input className="input" type="date" {...register("due_date")} /></label>
        </div>
      </div>
      <label className="label"><span className="label-text">Description</span><textarea className="textarea" placeholder="What needs to be fixed or delivered?" {...register("description")} /></label>
      <label className="label"><span className="label-text">Notes</span><textarea className="textarea" placeholder="Internal context, billing notes, or follow-up tasks" {...register("notes")} /></label>
      <div className="form-actions"><button className="button" disabled={isSubmitting || disabled}>{disabled ? "Saving..." : "Save request"}</button></div>
    </form>
  );
}
