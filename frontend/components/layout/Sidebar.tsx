"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Role } from "@/lib/roleGuard";

interface SidebarProps {
  role: Role;
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const employeeMenu = [
    {
      title: "CRM",
      items: [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Leads", href: "/dashboard/leads" },
        { label: "Contacts", href: "/dashboard/contacts" },
        { label: "Companies", href: "/dashboard/companies" },
        { label: "Deals", href: "/dashboard/deals" },
        { label: "My Profile", href: "/dashboard/profile" }
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
      title: "Team",
      items: [{ label: "Manage Employees", href: "/admin/employees" },
      { label: "My Profile", href: "/admin/profile" }  
      ],
    },
    {
      title: "CRM",
      items: [
        { label: "Dashboard", href: "/admin/dashboard" },
        { label: "Leads", href: "/admin/leads" },
        { label: "Contacts", href: "/admin/contacts" },
        { label: "Companies", href: "/admin/companies" },
        { label: "Deals", href: "/admin/deals" },
        { label: "My Profile", href: "/admin/profile" }
      ],
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
        { label: "Audit Logs", href: "/super-admin/audit-logs" }, 
        { label: "My Profile", href: "/super-admin/profile" }
        
      ],
    },
    {
      title: "CRM",
      items: [
        { label: "Leads", href: "/super-admin/leads" },
        { label: "Contacts", href: "/super-admin/contacts" },
        { label: "Companies", href: "/super-admin/companies" },
        { label: "Deals", href: "/super-admin/deals" },
        { label: "Audit Logs", href: "/super-admin/audit-logs" }, 
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
    role === "sales_rep"
      ? employeeMenu
      : role === "admin"
      ? adminMenu
      : superAdminMenu;

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-8">ClientFlow CRM</h1>

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
    </aside>
  );
}