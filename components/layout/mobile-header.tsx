// src/components/layout/mobile-header.tsx
"use client"

import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Gauge } from "lucide-react"
import { ReactNode } from "react"
import { ModeToggle } from "@/components/mode-toggle" // Importiamo il toggle qui

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
      
      {/* LATO SINISTRO: Tasto Indietro o Logo */}
      <div className="flex items-center gap-3 flex-1">
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
          <div className="bg-slate-900 dark:bg-green-900/20 text-white dark:text-green-400 p-1.5 rounded-lg shrink-0">
            <Gauge size={20} />
          </div>
        )}
        
        <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight truncate">
          {title}
        </h1>
      </div>

      {/* LATO DESTRO: Theme Toggle + Azioni Custom (es. Salva o Avatar) */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Il Theme Toggle è sempre presente ora */}
        <ModeToggle />
        
        {/* Spazio per bottoni extra (Salva, User, ecc) */}
        {rightAction && (
          <div className="pl-1 border-l border-slate-200 dark:border-slate-800 ml-1">
            {rightAction}
          </div>
        )}
      </div>
    </header>
  )
}