"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface PageLayoutProps {
  children: React.ReactNode
  title?: string 
  showBackButton?: boolean
  rightAction?: React.ReactNode
  className?: string
}

export function PageLayout({ 
  children, 
  title, 
  showBackButton = false, 
  rightAction, 
  className 
}: PageLayoutProps) {
  
  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault()
    if (window.history.length > 1) {
      window.history.back()
    } else {
      window.location.href = "/"
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
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
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  SagManager
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {rightAction}
          </div>

        </div>
      </header>

      <main className={cn("container max-w-5xl mx-auto p-4 md:p-6", className)}>
        {children}
      </main>
    </div>
  )
}