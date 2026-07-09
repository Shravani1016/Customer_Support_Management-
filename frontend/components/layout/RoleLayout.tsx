"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import { getUserRole, Role } from "@/lib/roleGuard";

interface Props {
  role: Role | Role[];
  children: React.ReactNode;
}

const ROLE_HOME: Record<Role, string> = {
  sales_rep: "/dashboard",
  manager: "/dashboard",
  admin: "/admin/dashboard",
  super_admin: "/super-admin/dashboard",
};

export default function RoleLayout({ role, children }: Props) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [userRole, setUserRole] = useState<Role | null>(null);

  useEffect(() => {
    const actualRole = getUserRole();
    setUserRole(actualRole);

    if (!actualRole) {
      router.replace("/login");
      return;
    }

    const allowed = Array.isArray(role) ? role.includes(actualRole) : actualRole === role;

    if (!allowed) {
      router.replace(ROLE_HOME[actualRole] || "/login");
      return;
    }

    setChecked(true);
  }, [role, router]);

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar role={userRole || (Array.isArray(role) ? role[0] : role)} />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}