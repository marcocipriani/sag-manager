import { MobileHeader } from "./mobile-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ReactNode } from "react" // Assicurati di importare ReactNode

interface PageLayoutProps {
  children: ReactNode
  title?: string
  action?: ReactNode      // Questo è solitamente il bottone flottante in basso (es. Salva)
  rightAction?: ReactNode // <--- AGGIUNTO: Questo è per l'icona nell'header in alto a destra
  isHomePage?: boolean
  showBackButton?: boolean
}

export function PageLayout({ 
  children, 
  title, 
  action, 
  rightAction, // <--- Recuperalo qui
  isHomePage,
  showBackButton 
}: PageLayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950">
      
      {/* Passiamo rightAction al MobileHeader */}
      <MobileHeader 
        title={title} 
        isHomePage={isHomePage} 
        showBackButton={showBackButton}
        rightAction={rightAction} // <--- Passalo qui
      />

      <ScrollArea className="flex-1">
        <div className="container max-w-md mx-auto p-4 pb-32">
          <main className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </main>
        </div>
      </ScrollArea>

      {/* Se c'è un'action flottante (es. pulsante Salva), la mostriamo qui */}
      {action && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent dark:from-slate-950 dark:via-slate-950 z-10">
          <div className="container max-w-md mx-auto">
            {action}
          </div>
        </div>
      )}
    </div>
  )
}