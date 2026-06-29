'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: '📊' },
  { label: 'Leads', href: '/dashboard/leads', icon: '🎯' },
  { label: 'Contacts', href: '/dashboard/contacts', icon: '👤' },
  { label: 'Companies', href: '/dashboard/companies', icon: '🏢' },
  { label: 'Deals', href: '/dashboard/deals', icon: '💰' },
  { label: 'Tasks', href: '/dashboard/tasks', icon: '✅' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold">CRM App</h1>
        <p className="text-gray-400 text-sm mt-1">{user?.full_name}</p>
        <span className="text-xs bg-blue-600 px-2 py-0.5 rounded-full mt-1 inline-block capitalize">
          {user?.role?.replace('_', ' ')}
        </span>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              pathname === item.href
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full text-left text-gray-400 hover:text-white text-sm px-3 py-2"
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}