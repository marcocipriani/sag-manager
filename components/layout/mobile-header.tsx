"use client"

import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image" 
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { ReactNode } from "react"
import { ModeToggle } from "@/components/mode-toggle"
import { usePreferences } from "@/components/preferences-provider"

interface MobileHeaderProps {
  title?: ReactNode
  rightAction?: ReactNode 
  showBackButton?: boolean
  isHomePage?: boolean
}

export function MobileHeader({ 
  title = "SagManager", 
  rightAction, 
  showBackButton,
  isHomePage = false
}: MobileHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { userName } = usePreferences()
  
  const shouldShowBack = showBackButton !== undefined ? showBackButton : pathname !== "/"

  return (
    <header className="bg-white dark:bg-slate-950 border-b dark:border-slate-800 px-4 py-3 flex justify-between items-center sticky top-0 z-50 shadow-sm h-16 transition-colors duration-300">
      
      <div className="flex items-center gap-3 flex-1 overflow-hidden">
        {shouldShowBack ? (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()} 
            className="-ml-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <ChevronLeft size={24} />
          </Button>
        ) : (
          <Link href="/" className="shrink-0 hover:opacity-80 transition-opacity">
            <Image 
              src="/icon.svg" 
              alt="SagManager Logo" 
              width={32} 
              height={32} 
              className="rounded-lg shadow-sm" 
            />
          </Link>
        )}

        <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight truncate flex items-baseline gap-1.5">
          {title}
          
          {!shouldShowBack && userName && (
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-in fade-in">
              + {userName}
            </span>
          )}
        </h1>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <ModeToggle />
        {rightAction && (
          <div className="pl-1 border-l border-slate-200 dark:border-slate-800 ml-1">
            {rightAction}
          </div>
        )}
      </div>
    </header>
  )
}