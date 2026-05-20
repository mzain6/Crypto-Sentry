"use client";

import { signOut } from "next-auth/react";

type DashboardLogoutButtonProps = {
  variant?: "button" | "icon";
};

export function DashboardLogoutButton({
  variant = "button",
}: DashboardLogoutButtonProps) {
  return (
    <button
      aria-label="Logout"
      className={
        variant === "icon" ? "terminal-logout icon" : "terminal-logout"
      }
      onClick={() => signOut({ callbackUrl: "/" })}
      type="button"
    >
      {variant === "icon" ? "->" : "Logout"}
    </button>
  );
}
