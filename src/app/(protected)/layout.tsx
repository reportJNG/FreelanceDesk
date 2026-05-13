"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoginPage } from "../../features/auth/LoginPage";
import { isSupabaseConfigured, supabase } from "../../lib/supabaseClient";
import { AppLayout } from "../../components/layout/AppLayout";

const titles: [RegExp, string][] = [
  [/^\/dashboard$/, "Dashboard"],
  [/^\/clients$/, "Clients"],
  [/^\/clients\/new$/, "New Client"],
  [/^\/clients\/[^/]+\/edit$/, "Edit Client"],
  [/^\/clients\/[^/]+$/, "Client Detail"],
  [/^\/projects$/, "Projects"],
  [/^\/projects\/new$/, "New Project"],
  [/^\/projects\/[^/]+\/edit$/, "Edit Project"],
  [/^\/projects\/[^/]+$/, "Project Detail"],
  [/^\/payments$/, "Payments"],
  [/^\/fixes$/, "Fixes / Support"],
  [/^\/fixes\/new$/, "New Support Request"],
  [/^\/reports$/, "Reports"],
  [/^\/reminders$/, "Reminders"],
  [/^\/settings$/, "Settings"],
];

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthed, setIsAuthed] = useState<boolean | null>(() => isSupabaseConfigured ? null : false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.auth.getSession().then(({ data }) => setIsAuthed(Boolean(data.session)));
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => setIsAuthed(Boolean(session)));
    return () => subscription.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (isAuthed === false) router.replace("/login");
  }, [isAuthed, router]);

  if (isAuthed === null) return <div className="content"><div className="card">Checking session...</div></div>;
  if (!isAuthed) return <LoginPage />;

  const title = titles.find(([pattern]) => pattern.test(pathname))?.[1] ?? "FreelanceDesk";
  return <AppLayout title={title}>{children}</AppLayout>;
}
