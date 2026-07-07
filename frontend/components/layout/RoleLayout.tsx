"use client";

import Sidebar from "./Sidebar";

type Role = "employee" | "admin" | "super_admin";

interface Props {
  role: Role;
  children: React.ReactNode;
}

export default function RoleLayout({
  role,
  children,
}: Props) {
  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar role={role} />

      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}