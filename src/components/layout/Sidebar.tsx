"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Bell, Briefcase, CreditCard, Gauge, LifeBuoy, Settings, Sparkles, Users } from "lucide-react";

export const navItems = [
  ["/dashboard", "Dashboard", Gauge],
  ["/clients", "Clients", Users],
  ["/projects", "Projects", Briefcase],
  ["/payments", "Payments", CreditCard],
  ["/fixes", "Fixes / Support", LifeBuoy],
  ["/reports", "Reports", BarChart3],
  ["/reminders", "Reminders", Bell],
  ["/settings", "Settings", Settings],
] as const;

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="sidebar">
      <Link className="brand" href="/dashboard">
        <span className="brand-mark"><Sparkles size={18} /></span>
        <span>FreelanceDesk</span>
      </Link>
      <nav className="nav">
        {navItems.map(([href, label, Icon]) => (
          <Link key={href} className={`nav-link ${pathname.startsWith(href) ? "active" : ""}`} href={href}>
            <Icon size={18} /> {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
