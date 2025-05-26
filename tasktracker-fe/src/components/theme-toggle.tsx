"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  // Only render after component is mounted (client-side)
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Use a button with just the container styles but no icons during SSR
  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className="bg-white/90 backdrop-blur-sm border-gray-200/50 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:border-amber-300 dark:bg-gray-800/80 dark:border-gray-700 dark:hover:bg-gradient-to-r dark:hover:from-amber-900/20 dark:hover:to-orange-900/20 dark:hover:border-amber-600 transition-all duration-300 shadow-sm hover:shadow-md">
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  // Determine which icon to show based on resolved theme
  const isDark = resolvedTheme === 'dark'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="bg-white/90 backdrop-blur-sm border-gray-200/50 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:border-amber-300 dark:bg-gray-800/80 dark:border-gray-700 dark:hover:bg-gradient-to-r dark:hover:from-amber-900/20 dark:hover:to-orange-900/20 dark:hover:border-amber-600 transition-all duration-300 shadow-sm hover:shadow-md">
          {isDark ? (
            <Moon className="h-[1.2rem] w-[1.2rem] transition-all text-gray-700 dark:text-gray-200" />
          ) : (
            <Sun className="h-[1.2rem] w-[1.2rem] transition-all text-gray-700 dark:text-gray-200" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 rounded-2xl shadow-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 z-[9999] overflow-hidden relative">
        {/* Enhanced decorative gradient bars */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 opacity-50"></div>
        
        {/* Header Section */}
        <div className="px-4 py-3 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              {isDark ? (
                <Moon className="h-4 w-4 text-white" />
              ) : (
                <Sun className="h-4 w-4 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                🎨 Theme Settings
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Current: {resolvedTheme === 'dark' ? 'Dark' : resolvedTheme === 'light' ? 'Light' : 'System'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="py-2">
        <DropdownMenuItem 
          onClick={() => setTheme("light")} 
          className={`mx-2 rounded-lg transition-all duration-200 hover:bg-amber-50/50 dark:hover:bg-amber-900/20 cursor-pointer font-medium ${
            theme === 'light' ? 'bg-amber-50/70 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700' : ''
          }`}
        >
          <Sun className="mr-2 h-4 w-4 text-amber-600 dark:text-amber-400" />
          <span className="text-gray-800 dark:text-gray-200">☀️ Light</span>
          {theme === 'light' && <span className="ml-auto text-amber-600 dark:text-amber-400">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")} 
          className={`mx-2 rounded-lg transition-all duration-200 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 cursor-pointer font-medium ${
            theme === 'dark' ? 'bg-indigo-50/70 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700' : ''
          }`}
        >
          <Moon className="mr-2 h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-gray-800 dark:text-gray-200">🌙 Dark</span>
          {theme === 'dark' && <span className="ml-auto text-indigo-600 dark:text-indigo-400">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")} 
          className={`mx-2 rounded-lg transition-all duration-200 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 cursor-pointer font-medium ${
            theme === 'system' ? 'bg-purple-50/70 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700' : ''
          }`}
        >
          <svg className="mr-2 h-4 w-4 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className="text-gray-800 dark:text-gray-200">💻 System</span>
          {theme === 'system' && <span className="ml-auto text-purple-600 dark:text-purple-400">✓</span>}
        </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 