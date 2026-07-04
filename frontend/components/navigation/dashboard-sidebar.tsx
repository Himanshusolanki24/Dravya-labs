import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { BarChart3, Zap, LogOut, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
}

interface User {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export default function Sidebar({ activeMenu, setActiveMenu }: SidebarProps) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  const menuItems = [
    { icon: BarChart3, label: 'Dashboard' },
    { icon: Zap, label: 'Live Analysis' }
  ];

  return (
    <div className="w-64 bg-gradient-to-b from-[#f0fdf4] via-[#f0f9ff] to-[#ffffff] border-r border-slate-200/80 flex flex-col h-screen text-slate-900">
      {/* Logo */}
      <div className="p-6 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-emerald-500/10">
            <Image
              src="/Logo.png"
              alt="Dravya Labs Logo"
              width={40}
              height={40}
              className="object-cover w-full h-full"
            />
          </div>
          <div>
            <div className="font-bold text-slate-800 tracking-wide">Dravya Labs</div>
            <div className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider">Ayurveda AI</div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => setActiveMenu(item.label)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeMenu === item.label
              ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 shadow-sm font-semibold'
              : 'text-slate-600 hover:bg-slate-100/50 hover:text-slate-900 hover:translate-x-0.5'
              }`}
          >
            <item.icon size={20} className={activeMenu === item.label ? 'text-emerald-600' : 'text-slate-400'} />
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-slate-200/80 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md shadow-emerald-500/10 shrink-0">
            {user?.firstName?.charAt(0).toUpperCase() || <User size={18} />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-slate-700 truncate">
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.email?.split('@')[0] || 'User'
              }
            </div>
            <div className="text-xs text-slate-500">Research Lead</div>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-slate-200/80">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 border border-slate-200 hover:border-red-200"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}