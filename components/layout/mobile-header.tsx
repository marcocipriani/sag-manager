// src/components/layout/mobile-header.tsx
"use client"

import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image" // Importiamo il componente Image
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { ReactNode } from "react"
import { ModeToggle } from "@/components/mode-toggle"

interface MobileHeaderProps {
  title?: string
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
  
  // Se non specificato, mostra il tasto indietro su tutte le pagine tranne la home
  const shouldShowBack = showBackButton !== undefined ? showBackButton : pathname !== "/"

  return (
    <header className="bg-white dark:bg-slate-950 border-b dark:border-slate-800 px-4 py-3 flex justify-between items-center sticky top-0 z-50 shadow-sm h-16 transition-colors duration-300">
      
      {/* LATO SINISTRO: Tasto Indietro o Logo Ufficiale */}
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
          // LOGO UFFICIALE (Cliccabile -> Home)
          <Link href="/" className="shrink-0 hover:opacity-80 transition-opacity">
            <Image 
              src="/icon.svg" 
              alt="SagManager Logo" 
              width={32} 
              height={32} 
              className="rounded-lg shadow-sm" // Arrotondiamo leggermente per coerenza
            />
          </Link>
        )}
        
        <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight truncate">
          {title}
        </h1>
      </div>

      {/* LATO DESTRO: Theme Toggle + Azioni Custom */}
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