"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import { getUserRole, Role } from "@/lib/roleGuard";

interface Props {
  role: Role;
  children: React.ReactNode;
}

const ROLE_HOME: Record<Role, string> = {
  sales_rep: "/dashboard",
  admin: "/admin/dashboard",
  super_admin: "/super-admin/dashboard",
};

export default function RoleLayout({ role, children }: Props) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const actualRole = getUserRole();

    if (!actualRole) {
      router.replace("/login");
      return;
    }

    if (actualRole !== role) {
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
      <Sidebar role={role} />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}