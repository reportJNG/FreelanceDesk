"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems, Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppLayout({ title, children }: { title: string; children: ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main">
        <Topbar title={title} />
        <nav className="mobile-nav">
          {navItems.map(([href, label, Icon]) => (
            <Link key={href} className={`nav-link ${isActive(href) ? "active" : ""}`} href={href} aria-current={isActive(href) ? "page" : undefined}>
              <Icon size={16} /> {label}
            </Link>
          ))}
        </nav>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
