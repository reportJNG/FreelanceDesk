"use client";

import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "../../components/common/PageHeader";
import { LoadingState } from "../../components/common/LoadingState";
import { ErrorState } from "../../components/common/ErrorState";
import { EmptyState } from "../../components/common/EmptyState";
import { titleize } from "../../lib/format";
import { remindersApi } from "./remindersApi";

export function RemindersPage() {
  const query = useQuery({ queryKey: ["reminders"], queryFn: remindersApi.list });
  if (query.isLoading) return <LoadingState />;
  if (query.error) return <ErrorState error={query.error} />;
  const entries = Object.entries(query.data ?? {});
  return <>
    <PageHeader title="Reminders" />
    <div className="grid">
      {entries.map(([group, items]) => (
        <div className="card" key={group}>
          <h3>{titleize(group)}</h3>
          {items.length === 0 ? <p className="muted">Nothing here.</p> : items.map((item, index) => <pre key={index} className="muted" style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(item, null, 2)}</pre>)}
        </div>
      ))}
      {entries.length === 0 ? <EmptyState title="No reminders" /> : null}
    </div>
  </>;
}

