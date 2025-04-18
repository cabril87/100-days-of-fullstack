"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { User, Bell } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // Generate title from pathname
  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname === '/tasks') return 'Tasks';
    if (pathname.startsWith('/tasks/')) {
      if (pathname.includes('/new')) return 'New Task';
      if (pathname.includes('/edit/')) return 'Edit Task';
      return 'Task Details';
    }
    if (pathname === '/categories') return 'Categories';
    if (pathname.startsWith('/categories/')) {
      if (pathname.includes('/new')) return 'New Category';
      return 'Edit Category';
    }
    if (pathname === '/statistics') return 'Statistics';
    if (pathname === '/settings') return 'Settings';
    return 'TaskTracker';
  };

  return (
    <header className="h-16 md:h-14 flex items-center justify-between px-4 md:px-6 border-b bg-card">
      <div className="flex-1 flex items-center">
        <h1 className="text-lg font-semibold ml-8 md:ml-0">{getPageTitle()}</h1>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar>
                <AvatarFallback>
                  {user?.username ? user.username.substring(0, 2).toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <User className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
} 