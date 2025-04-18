"use client";

import React, { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard, 
  CheckSquare, 
  ListTodo, 
  Tag, 
  BarChart2, 
  Settings, 
  LogOut, 
  User, 
  Menu, 
  X
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

type MainLayoutProps = {
  children: ReactNode;
};

// Define public routes that don't require authentication
const publicRoutes = ['/', '/login', '/register'];

export default function MainLayout({ children }: MainLayoutProps) {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const isPublicRoute = publicRoutes.includes(pathname);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: 'Tasks', href: '/tasks', icon: <CheckSquare className="h-5 w-5" /> },
    { name: 'Todo List', href: '/todo', icon: <ListTodo className="h-5 w-5" /> },
    { name: 'Categories', href: '/categories', icon: <Tag className="h-5 w-5" /> },
    { name: 'Statistics', href: '/statistics', icon: <BarChart2 className="h-5 w-5" /> },
    { name: 'Settings', href: '/settings', icon: <Settings className="h-5 w-5" /> },
  ];

  useEffect(() => {
    if (isLoading) return;
    
    // Redirect to login if not authenticated and not on a public route
    if (!isAuthenticated && !isPublicRoute) {
      router.push('/login');
    }
    
    // Redirect authenticated users from login/register pages to dashboard
    if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
      router.push('/dashboard');
    }
    
    // Home page (/) is accessible to everyone, no redirection needed
  }, [isAuthenticated, isLoading, isPublicRoute, router, pathname]);

  // If we're loading auth state, show a simple loading screen
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // If it's a public route, render without layout
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // For protected routes, render with the app layout
  return isAuthenticated ? (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-4 md:p-6">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  ) : null; // Return null while redirecting
} 