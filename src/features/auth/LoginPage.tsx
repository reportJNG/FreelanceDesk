"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { isSupabaseConfigured, missingSupabaseMessage, supabase } from "../../lib/supabaseClient";

export function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!isSupabaseConfigured) {
      toast.error(missingSupabaseMessage);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) toast.error(error.message);
    else router.push("/dashboard");
  }
  return (
    <main className="auth-page">
      <form className="card grid auth-card" onSubmit={submit} autoComplete="off">
        <div>
          <h1 className="auth-title">FreelanceDesk</h1>
          <p className="muted">Sign in to your private dashboard.</p>
        </div>
        {!isSupabaseConfigured ? (
          <div className="card setup-note">
            <strong>Setup needed</strong>
            <p className="muted">{missingSupabaseMessage}</p>
          </div>
        ) : null}
        <label className="label">Email<input className="input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="off" /></label>
        <label className="label">Password<input className="input" type="password" value={password} onChange={(event) => setPassword(event.target.value)}  autoComplete="off"/></label>
        <button className="button" disabled={loading || !isSupabaseConfigured}>{loading ? "Signing in..." : "Sign in"}</button>
      </form>
    </main>
  );
}
