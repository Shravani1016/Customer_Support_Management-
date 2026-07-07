"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";

type Role = "employee" | "admin" | "super_admin";

interface SidebarProps {
  role: Role;
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();

  const employeeMenu = [
    {
      title: "CRM",
      items: [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Leads", href: "/dashboard/leads" },
        { label: "Contacts", href: "/dashboard/contacts" },
        { label: "Companies", href: "/dashboard/companies" },
        { label: "Deals", href: "/dashboard/deals" },
      ],
    },
    {
      title: "Activities",
      items: [
        { label: "Tasks", href: "/dashboard/tasks" },
        { label: "Activities", href: "/dashboard/activities" },
      ],
    },
    {
      title: "Reports",
      items: [{ label: "Reports", href: "/dashboard/reports" }],
    },
  ];

  const adminMenu = [
    {
      title: "CRM",
      items: [
        { label: "Dashboard", href: "/admin/dashboard" },
        { label: "Leads", href: "/admin/leads" },
        { label: "Contacts", href: "/admin/contacts" },
        { label: "Companies", href: "/admin/companies" },
        { label: "Deals", href: "/admin/deals" },
      ],
    },
    {
      title: "Team",
      items: [{ label: "Manage Employees", href: "/admin/employees" }],
    },
    {
      title: "Activities",
      items: [
        { label: "Tasks", href: "/admin/tasks" },
        { label: "Activities", href: "/admin/activities" },
      ],
    },
    {
      title: "Reports",
      items: [{ label: "Reports", href: "/admin/reports" }],
    },
  ];

  const superAdminMenu = [
    {
      title: "Management",
      items: [
        { label: "Dashboard", href: "/super-admin/dashboard" },
        { label: "Manage Admins", href: "/super-admin/admins" },
        { label: "Manage Employees", href: "/super-admin/employees" },
      ],
    },
    {
      title: "CRM",
      items: [
        { label: "Leads", href: "/super-admin/leads" },
        { label: "Contacts", href: "/super-admin/contacts" },
        { label: "Companies", href: "/super-admin/companies" },
        { label: "Deals", href: "/super-admin/deals" },
      ],
    },
    {
      title: "Activities",
      items: [
        { label: "Tasks", href: "/super-admin/tasks" },
        { label: "Activities", href: "/super-admin/activities" },
      ],
    },
    {
      title: "Reports",
      items: [{ label: "Reports", href: "/super-admin/reports" }],
    },
  ];

  const menu =
    role === "employee"
      ? employeeMenu
      : role === "admin"
      ? adminMenu
      : superAdminMenu;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white p-6 flex flex-col">
      <h1 className="text-2xl font-bold mb-8">ClientFlow CRM</h1>

      <div className="flex-1">
        {menu.map((section) => (
          <div key={section.title} className="mb-8">
            <h2 className="text-xs uppercase text-gray-400 mb-3">
              {section.title}
            </h2>

            <div className="space-y-2">
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-4 py-2 rounded-lg ${
                    pathname === item.href
                      ? "bg-violet-600"
                      : "hover:bg-slate-800"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-700 pt-4 space-y-3">
        {user?.email && (
          <p className="text-xs text-gray-400 truncate px-4">{user.email}</p>
        )}
        <div className="flex items-center justify-between px-4">
          <span className="text-sm text-gray-300">Theme</span>
          <ThemeToggle />
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-2 rounded-lg text-sm text-red-400 hover:bg-slate-800 hover:text-red-300 transition"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}