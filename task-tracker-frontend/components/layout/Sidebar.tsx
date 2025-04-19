"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  X, 
  Home, 
  CheckSquare, 
  BarChart2, 
  Tag, 
  Settings, 
  LogOut,
  Menu,
  Folder,
  LayoutGrid
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
  };

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: <Home className="h-5 w-5" />,
    },
    {
      name: 'Tasks',
      href: '/tasks',
      icon: <CheckSquare className="h-5 w-5" />,
    },
    {
      name: 'Task Board',
      href: '/tasks/board',
      icon: <LayoutGrid className="h-5 w-5" />,
    },
    {
      name: 'Categories',
      href: '/categories',
      icon: <Folder className="h-5 w-5" />,
    },
    {
      name: 'Statistics',
      href: '/statistics',
      icon: <BarChart2 className="h-5 w-5" />,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return (
    <>
      {/* Mobile Menu Button (visible in the Header component) */}
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={toggleSidebar} 
        className="md:hidden fixed top-4 left-4 z-50"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-card shadow-lg border-r w-64 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:z-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar header */}
        <div className="h-16 flex items-center justify-between px-4 border-b">
          <h2 className="text-xl font-bold">TaskTracker</h2>
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Nav links */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link 
              key={item.name} 
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                isActive(item.href)
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-foreground/70 hover:text-foreground hover:bg-muted"
              )}
              onClick={closeSidebar}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>

        {/* User section */}
        {user && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-card">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.username}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
} 