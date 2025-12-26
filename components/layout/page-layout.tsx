"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { usePreferences } from "@/components/preferences-provider"

interface PageLayoutProps {
  children: React.ReactNode
  title?: React.ReactNode 
  showBackButton?: boolean
  rightAction?: React.ReactNode
  className?: string
  isHomePage?: boolean
}

export function PageLayout({ 
  children, 
  title, 
  showBackButton = false, 
  rightAction, 
  className 
}: PageLayoutProps) {
  
  const { userName } = usePreferences()

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault()
    if (window.history.length > 1) {
      window.history.back()
    } else {
      window.location.href = "/"
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md transition-colors duration-300">
        <div className="flex h-16 items-center px-4 max-w-5xl mx-auto justify-between">
          
          <div className="flex items-center gap-3 overflow-hidden">
            {showBackButton ? (
              <>
                <Link href=".." onClick={handleBack}>
                  <Button variant="ghost" size="icon" className="-ml-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                    <ArrowLeft size={20} />
                  </Button>
                </Link>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                  {title}
                </h1>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <div className="relative w-8 h-8 rounded-lg overflow-hidden">
                   <Image 
                     src="/icon.svg" 
                     alt="SagManager Logo" 
                     fill 
                     className="object-contain"
                   />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    SagManager
                  </span>
                  {userName && (
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-in fade-in">
                      + {userName}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center">
            
            <ThemeSwitcher />

            {rightAction && (
              <>
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-2 sm:mx-3" />
                <div className="flex items-center gap-2 shrink-0">
                  {rightAction}
                </div>
              </>
            )}
          </div>

        </div>
      </header>

      <main className={cn("container max-w-5xl mx-auto p-4 md:p-6", className)}>
        {children}
      </main>
    </div>
  )
}