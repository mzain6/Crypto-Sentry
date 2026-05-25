"use client";

import type { Session } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { DashboardLogoutButton } from "./logout-button";

type DashboardSidebarProps = {
  user: Session["user"];
};

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "grid", id: "nav-dashboard" },
  { href: "/watchlist", label: "Watchlist", icon: "list", id: "nav-watchlist" },
  { href: "/alerts", label: "Alerts", icon: "bell", id: "nav-alerts" },
  {
    href: "/market-data",
    label: "Market Data",
    icon: "scan",
    id: "nav-market-data",
  },
  { href: "/profile", label: "Profile", icon: "user" },
  { href: "/settings", label: "Settings", icon: "gear", id: "nav-settings" },
];

function getInitial(name?: string | null) {
  return name?.slice(0, 1).toUpperCase() || "U";
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <aside className={menuOpen ? "terminal-sidebar open" : "terminal-sidebar"}>
      <button
        aria-expanded={menuOpen}
        aria-label="Toggle dashboard navigation"
        className="terminal-sidebar-toggle"
        onClick={() => setMenuOpen((open) => !open)}
        type="button"
      >
        <span />
        <span />
        <span />
      </button>

      <div className="terminal-brand" id="sidebar-brand">
        <div className="terminal-brand-mark" aria-hidden="true" />
        <div>
          <strong>BITBASH</strong>
          <span>SENTRY V4</span>
        </div>
      </div>

      <nav
        className="terminal-nav"
        aria-label="Dashboard navigation"
        id="sidebar-navigation"
      >
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`);

          return (
            <Link
              className={active ? "terminal-nav-link active" : "terminal-nav-link"}
              href={item.href}
              id={item.id}
              key={item.href}
              prefetch
            >
              <span className={`terminal-nav-icon ${item.icon}`} aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="terminal-sidebar-user" id="sidebar-user">
        {user.image ? (
          <Image
            alt={`${user.name ?? "User"} avatar`}
            className="terminal-avatar image"
            height={42}
            src={user.image}
            width={42}
          />
        ) : (
          <div className="terminal-avatar">{getInitial(user.name)}</div>
        )}
        <div className="terminal-sidebar-user-copy">
          <strong>{user.name}</strong>
          <span>{user.email}</span>
        </div>
        <DashboardLogoutButton variant="icon" />
      </div>
    </aside>
  );
}
