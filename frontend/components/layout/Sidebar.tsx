'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { Role } from '@/lib/roleGuard';
import ThemeToggle from '@/components/ThemeToggle';
import { Trash2 } from 'lucide-react';

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
        { label: "Trash", href: "/dashboard/trash", icon: Trash2 },
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
      items: [
        { label: "Manage Employees", href: "/admin/employees" },
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
        { label: "Trash", href: "/admin/trash", icon: Trash2 }
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
        { label: "My Profile", href: "/super-admin/profile" },
        { label: "Trash", href: "/super-admin/trash", icon: Trash2 }
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

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">

      {/* Brand */}
      <div className="border-b border-slate-100 dark:border-slate-700 px-5 py-5">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/30">
            <span className="text-sm font-bold">CF</span>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">ClientFlow</p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-indigo-600">CRM</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {menu.map((section) => (
          <div key={section.title} className="mb-6">
            <h2 className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {section.title}
            </h2>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const Icon = (item as { icon?: typeof Trash2 }).icon;
                const active =
                  pathname === item.href ||
                  (item.href !== '/dashboard' && pathname?.startsWith(item.href));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                        active
                          ? 'bg-linear-to-r from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-700 dark:hover:text-white'
                      }`}
                    >
                      {Icon && <Icon size={18} className="shrink-0" />}
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-slate-100 dark:border-slate-700 p-3">
        <div className="flex items-center gap-2 rounded-lg p-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-semibold text-white flex-shrink-0">
            {user?.full_name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
              {user?.full_name ?? 'User'}
            </p>
            <p className="text-xs font-medium uppercase tracking-wider text-indigo-600">
              {role}
            </p>
          </div>
        </div>
      </div>

      {/* Theme + Logout */}
      <div className="border-t border-slate-100 dark:border-slate-700 p-3 space-y-2">
        {user?.email && (
          <p className="text-xs text-slate-400 truncate px-2">{user.email}</p>
        )}
        <div className="flex items-center justify-between px-2">
          <span className="text-sm text-slate-500 dark:text-slate-400">Theme</span>
          <ThemeToggle />
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-left px-2 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-slate-800 dark:hover:text-red-400 transition"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}