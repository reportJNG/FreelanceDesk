"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Moon, Plus, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "../../lib/supabaseClient";

export function Topbar({ title }: { title: string }) {
  const router = useRouter();
  const [theme, setTheme] = useState(() => typeof window === "undefined" ? "light" : localStorage.getItem("freelancedesk-theme") ?? "light");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("freelancedesk-theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((current) => current === "dark" ? "light" : "dark");
  }

  async function logout() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.push("/login");
  }

  return (
    <header className="topbar">
      <div className="topbar-title">
        <div className="topbar-kicker">Private admin dashboard</div>
        <strong>{title}</strong>
      </div>
      <div className="topbar-actions">
        <Link className="button" href="/clients/new"><Plus size={16} /> Add Client</Link>
        <button className="button secondary" onClick={toggleTheme} title="Toggle theme" aria-label="Toggle theme">
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button className="button secondary" onClick={logout} title="Sign out"><LogOut size={16} /> Logout</button>
      </div>
    </header>
  );
}
