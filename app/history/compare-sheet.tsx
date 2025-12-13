"use client"

import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowRight } from "lucide-react"

interface CompareSheetProps {
  isOpen: boolean
  onClose: () => void
  sessionA: any
  sessionB: any
}

export function CompareSheet({ isOpen, onClose, sessionA, sessionB }: CompareSheetProps) {
  if (!sessionA || !sessionB) return null

  // Ordiniamo cronologicamente: A è il vecchio, B è il nuovo
  const [oldS, newS] = new Date(sessionA.created_at) < new Date(sessionB.created_at) 
    ? [sessionA, sessionB] 
    : [sessionB, sessionA]

  // Helper per renderizzare una riga di confronto
  const CompareRow = ({ label, keyName, unit }: { label: string, keyName: string, unit?: string }) => {
    const valA = oldS[keyName]
    const valB = newS[keyName]
    
    // Se entrambi nulli o uguali, mostriamo in modo neutro
    const isDiff = valA != valB // Usa != loose equality per catturare null vs undefined vs numeri simili
    
    return (
      <div className={`flex items-center justify-between py-2 text-sm border-b border-slate-100 dark:border-slate-800 last:border-0 ${isDiff ? "bg-yellow-50/50 dark:bg-yellow-900/10 px-2 -mx-2 rounded-md" : ""}`}>
        <span className="text-slate-500 w-1/3 truncate">{label}</span>
        
        <div className="flex items-center w-2/3 justify-end gap-3">
          <span className={`font-mono ${isDiff ? "text-slate-400 line-through text-xs" : "font-semibold dark:text-slate-200"}`}>
             {valA ?? "-"}
          </span>
          
          {isDiff && (
            <>
              <ArrowRight size={12} className="text-slate-300" />
              <span className="font-bold text-slate-900 dark:text-white font-mono">
                {valB ?? "-"}
              </span>
            </>
          )}
          
          {unit && <span className="text-[10px] text-slate-400 w-6 text-right">{unit}</span>}
        </div>
      </div>
    )
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md dark:bg-slate-950 dark:border-slate-800 p-0">
        <SheetHeader className="p-4 bg-slate-50 dark:bg-slate-900 border-b dark:border-slate-800">
          <SheetTitle className="flex items-center justify-between text-base dark:text-white">
            <span>Confronto Setup</span>
            <Badge variant="outline" className="text-[10px] font-normal gap-1 dark:border-slate-700 dark:text-slate-300">
              {new Date(oldS.created_at).toLocaleDateString('it-IT', {day: '2-digit', month: '2-digit'})} <ArrowRight size={8} /> {new Date(newS.created_at).toLocaleDateString('it-IT', {day: '2-digit', month: '2-digit'})}
            </Badge>
          </SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-80px)] p-4">
          <div className="space-y-6 pb-10">
            
            {/* Header Visivo */}
            <div className="grid grid-cols-2 gap-4 text-center mb-6">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Prima</div>
                <div className="font-bold truncate text-sm dark:text-white">{oldS.name}</div>
              </div>
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-900">
                <div className="text-[10px] uppercase font-bold opacity-70">Dopo</div>
                <div className="font-bold truncate text-sm">{newS.name}</div>
              </div>
            </div>

            {/* SEZIONE GOMME */}
            <section>
              <h4 className="font-bold text-sm mb-2 text-green-600 uppercase tracking-wider">Gomme</h4>
              <CompareRow label="Press. Ant" keyName="tire_pressure_f" unit="bar" />
              <CompareRow label="Press. Post" keyName="tire_pressure_r" unit="bar" />
              <CompareRow label="Modello" keyName="tires_model" />
            </section>

            {/* SEZIONE FORCELLA */}
            <section>
              <h4 className="font-bold text-sm mb-2 text-green-600 uppercase tracking-wider">Forcella</h4>
              <CompareRow label="Compressione" keyName="fork_comp" unit="clk" />
              <CompareRow label="Estensione" keyName="fork_reb" unit="clk" />
              <CompareRow label="Precarico" keyName="fork_preload" unit="giri" />
              <CompareRow label="Molla" keyName="fork_spring" unit="K" />
              <CompareRow label="Olio" keyName="fork_oil_level" unit="mm" />
              <CompareRow label="Sfilamento" keyName="fork_height" unit="mm" />
            </section> {/* <--- QUI ERA L'ERRORE: Ora è chiuso correttamente */}

            {/* SEZIONE MONO */}
            <section>
              <h4 className="font-bold text-sm mb-2 text-green-600 uppercase tracking-wider">Mono</h4>
              <CompareRow label="Compressione" keyName="shock_comp" unit="clk" />
              <CompareRow label="Estensione" keyName="shock_reb" unit="clk" />
              <CompareRow label="Precarico" keyName="shock_preload" unit="mm" />
              <CompareRow label="Molla" keyName="shock_spring" unit="K" />
              <CompareRow label="Interasse" keyName="shock_length" unit="mm" />
            </section>

             {/* SEZIONE GEOMETRIA */}
             <section>
              <h4 className="font-bold text-sm mb-2 text-green-600 uppercase tracking-wider">Geometria</h4>
              <CompareRow label="Interasse" keyName="wheelbase" unit="mm" />
              <CompareRow label="Inclinazione" keyName="rake" unit="°" />
              <CompareRow label="Trail" keyName="trail" unit="mm" />
            </section>

          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}