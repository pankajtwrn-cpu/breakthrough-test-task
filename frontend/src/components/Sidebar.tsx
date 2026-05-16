'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  History, 
  LogOut, 
  Box, 
  Settings,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Audit Logs', href: '/audit', icon: History },
  ];

  return (
    <div className="w-64 glass border-r border-white/5 flex flex-col h-screen sticky top-0 shrink-0">
      <div className="p-8">
        <div className="flex items-center space-x-3 mb-10">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg shadow-lg shadow-indigo-500/50 flex items-center justify-center font-bold text-white italic">W</div>
          <span className="text-xl font-bold text-white tracking-tight">Wellspring</span>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-8 space-y-6">
        <div className="space-y-1">
           <button className="flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-white transition-colors w-full rounded-xl hover:bg-white/5 text-sm">
             <HelpCircle size={18} />
             <span>Support</span>
           </button>
           <button 
             onClick={logout}
             className="flex items-center space-x-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-400/5 transition-all w-full rounded-xl text-sm"
           >
             <LogOut size={18} />
             <span>Logout</span>
           </button>
        </div>
        
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/5">
          <p className="text-[10px] uppercase font-bold text-indigo-400 tracking-widest mb-1">PRO PLAN</p>
          <p className="text-xs text-gray-400 leading-tight">Elevate your wellness brand with advanced analytics.</p>
        </div>
      </div>
    </div>
  );
}
