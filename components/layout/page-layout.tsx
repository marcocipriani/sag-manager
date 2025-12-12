import { ReactNode } from "react"
import { MobileHeader } from "@/components/layout/mobile-header"

interface PageLayoutProps {
  children: ReactNode
  title?: string
  action?: ReactNode // Il bottone extra a destra (es. Salva)
  isHomePage?: boolean // Se true, mostra il logo invece della freccia indietro
}

export function PageLayout({ 
  children, 
  title, 
  action, 
  isHomePage = false 
}: PageLayoutProps) {
  return (
    // Questo div gestisce lo sfondo di TUTTA la pagina
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
      
      {/* Header Standardizzato */}
      <MobileHeader 
        title={title} 
        rightAction={action} 
        isHomePage={isHomePage}
        // Se è home page, forza a nascondere il back button
        showBackButton={isHomePage ? false : undefined} 
      />

      {/* Contenuto Pagina Standardizzato */}
      <main className="flex-1 p-4 max-w-md mx-auto w-full space-y-6 animate-in fade-in duration-500">
        {children}
      </main>
    </div>
  )
}