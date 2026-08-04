'use client'

import React from 'react';
import { Settings, User, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar = () => {
  const pathname = usePathname();

  const isActive = (path) => {
    if (path === '/mypage') {
      return pathname.startsWith('/mypage');
    }
    if (path === '/mygroups') {
      return pathname.startsWith('/mygroups');
    }
    if (path === '/mysettings') {
      return pathname.startsWith('/mysettings');
    }
    return false;
  };

  const navItems = [
    {
      href: '/mypage',
      icon: User,
      label: 'Personal Tasks',
    },
    {
      href: '/mygroups',
      icon: Users,
      label: 'Collaborative Groups',
    },
    {
      href: '/mysettings',
      icon: Settings,
      label: 'Settings',
    },
  ];

  return (
    <div className='w-16 h-full bg-[#09090b]/40 border-r border-zinc-900 flex flex-col items-center py-6 gap-6 shrink-0 z-40'>
      {navItems.map((item, index) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        
        return (
          <Link 
            key={index}
            href={item.href}
            title={item.label}
            className={`p-3 rounded-xl transition-all duration-200 group ${
              active 
                ? 'bg-white text-zinc-950 font-semibold shadow-lg shadow-white/5' 
                : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/50'
            }`}
          >
            <Icon className="h-5 w-5 group-hover:scale-105 transition-transform" />
          </Link>
        );
      })}
    </div>
  );
}

export default Sidebar;
