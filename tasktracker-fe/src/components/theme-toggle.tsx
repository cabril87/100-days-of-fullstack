"use client"

import * as React from "react"
import { Moon, Sun, Palette } from "lucide-react"
import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { useTheme } from "@/lib/providers/ThemeProvider"
import { ThemeModal } from "@/components/theme/ThemeModal"

export function ThemeToggle() {
  const { 
    resolvedMode,
    customTheme,
    isLoading,
    isModalOpen,
    openModal,
    closeModal
  } = useTheme()
  
  const [mounted, setMounted] = useState(false)
  
  // Only render after component is mounted (client-side)
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Use a button with just the container styles but no icons during SSR
  if (!mounted || isLoading) {
    return (
      <Button variant="outline" size="icon" className="navbar-theme theme-transition">
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  // Determine which icon to show based on resolved theme
  const isDark = resolvedMode === 'dark'
  const hasCustomTheme = customTheme !== null

  // Get theme-aware gradient classes
  const getThemeGradient = () => {
    if (hasCustomTheme) {
      return "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600";
    } else if (isDark) {
      return "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600";
    } else {
      return "bg-gradient-to-r from-orange-400 to-yellow-500 hover:from-orange-500 hover:to-yellow-600";
    }
  };

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        className={`navbar-theme theme-transition hover:scale-105 text-white shadow-md ${getThemeGradient()}`}
        onClick={openModal}
        title="Open Theme Gallery"
      >
        {hasCustomTheme ? (
          <Palette className="h-[1.2rem] w-[1.2rem] text-white transition-all" />
        ) : isDark ? (
          <Moon className="h-[1.2rem] w-[1.2rem] text-white transition-all" />
        ) : (
          <Sun className="h-[1.2rem] w-[1.2rem] text-white transition-all" />
        )}
        <span className="sr-only">Open theme gallery</span>
      </Button>
      
      <ThemeModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  )
} 
