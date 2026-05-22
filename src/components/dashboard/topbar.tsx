import Image from "next/image";
import type { Session } from "next-auth";

import { DashboardLogoutButton } from "./logout-button";

type DashboardTopbarProps = {
  user: Session["user"];
};

function getInitial(name?: string | null) {
  return name?.slice(0, 1).toUpperCase() || "U";
}

export function DashboardTopbar({ user }: DashboardTopbarProps) {
  return (
    <header className="terminal-topbar">
      <div className="terminal-topbar-meta">
        <div className="terminal-network">
          <span>Network Status</span>
          <strong>MAINNET OPERATIONAL</strong>
        </div>
        <div className="terminal-user-chip">
          <span>User Instance</span>
          <strong>{user.name}</strong>
        </div>
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
        <DashboardLogoutButton />
      </div>
    </header>
  );
}
