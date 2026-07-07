'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import {
  LayoutDashboard, Target, Users, Building2,
  DollarSign, CheckSquare, Activity, BarChart3, LogOut,
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

const nav = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Leads', href: '/dashboard/leads', icon: Target },
  { label: 'Contacts', href: '/dashboard/contacts', icon: Users },
  { label: 'Companies', href: '/dashboard/companies', icon: Building2 },
  { label: 'Deals', href: '/dashboard/deals', icon: DollarSign },
  { label: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
  { label: 'Activities', href: '/dashboard/activities', icon: Activity },
  { label: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
];
interface SidebarProps {
  role: 'employee' | 'admin' | 'super-admin';
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
        <ul className="space-y-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-700 dark:hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User + Theme Toggle */}
       <div className="border-t border-slate-100 dark:border-slate-700 p-3">
        <div className="flex items-center gap-2 rounded-lg p-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-semibold text-white flex-shrink-0">
            {user?.full_name?.[0]?.toUpperCase() ?? 'U'}
          </div>
        
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