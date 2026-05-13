"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "../../components/common/PageHeader";
import { LoadingState } from "../../components/common/LoadingState";
import { ErrorState } from "../../components/common/ErrorState";
import { settingsApi } from "./settingsApi";

export function SettingsPage() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["settings"], queryFn: settingsApi.get });
  const mutation = useMutation({ mutationFn: settingsApi.update, onSuccess: () => { toast.success("Settings saved"); queryClient.invalidateQueries({ queryKey: ["settings"] }); }, onError: (error) => toast.error(error instanceof Error ? error.message : "Could not save settings") });
  if (query.isLoading) return <LoadingState />;
  if (query.error) return <ErrorState error={query.error} />;
  const settings = query.data!;
  return <>
    <PageHeader title="Settings" description="Admin preferences and data safety." />
    <form className="card grid" onSubmit={(event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      mutation.mutate({ theme: form.get("theme"), currency: form.get("currency"), reminder_days_before: Number(form.get("reminder_days_before")) });
    }}>
      <div className="form-grid">
        <label className="label">Theme<select className="select" name="theme" defaultValue={settings.theme}><option>system</option><option>light</option><option>dark</option></select></label>
        <label className="label">Currency<input className="input" name="currency" defaultValue={settings.currency} /></label>
        <label className="label">Reminder days before<input className="input" type="number" name="reminder_days_before" defaultValue={settings.reminder_days_before} /></label>
      </div>
      <div className="form-actions"><button className="button" disabled={mutation.isPending}>{mutation.isPending ? "Saving..." : "Save settings"}</button></div>
    </form>
    <div className="card section-gap">
      <h3 className="card-title">Security note</h3>
      <p className="muted">Keep real passwords in a password manager. FreelanceDesk only stores optional notes or references and hides sensitive project fields by default.</p>
    </div>
  </>;
}
