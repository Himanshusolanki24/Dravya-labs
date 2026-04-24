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
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden ">
            <Image
              src="/Logo.png"
              alt="Dravya Labs Logo"
              width={40}
              height={40}
              className="object-cover w-full h-full"
            />
          </div>
          <div>
            <div className="font-semibold text-gray-900">Dravya Labs</div>
            <div className="text-xs text-green-600 font-medium">Dravya Identification</div>
          </div>
        </div>
      </div>



      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => setActiveMenu(item.label)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeMenu === item.label
              ? 'bg-green-100 text-green-700 border border-green-200 shadow-sm'
              : 'text-gray-600 hover:bg-green-50 hover:text-green-600'
              }`}
          >
            <item.icon size={20} />
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-b border-gray-200 bg-green-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 border-2 border-green-300 rounded-full flex items-center justify-center font-semibold text-green-700">
            <User size={18} />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-gray-900 truncate">
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.email?.split('@')[0] || 'User'
              }
            </div>
            <div className="text-xs text-green-600">Research Lead</div>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 border border-red-200 hover:border-red-300"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}