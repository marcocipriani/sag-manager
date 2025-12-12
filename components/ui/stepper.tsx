// src/components/ui/stepper.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Minus, Plus, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

interface StepperProps {
  label: string
  value: number
  previousValue?: number
  unit?: string
  step?: number
  min?: number
  max?: number
  onChange: (val: number) => void
}

export function Stepper({ 
  label, 
  value, 
  previousValue,
  unit = "", 
  step = 1, 
  min = 0,
  max = 999,
  onChange 
}: StepperProps) {
  
  // LOGICA DI CONFRONTO
  // Se previousValue esiste ed è diverso dal valore attuale -> è cambiato
  const hasChanged = previousValue !== undefined && value !== previousValue

  const handleDecrease = (e: React.MouseEvent) => {
    e.preventDefault();
    if (value - step >= min) {
      // Arrotondamento per evitare 2.300000001
      onChange(Math.round((value - step) * 100) / 100)
    }
  }

  const handleIncrease = (e: React.MouseEvent) => {
    e.preventDefault();
    if (value + step <= max) {
      onChange(Math.round((value + step) * 100) / 100)
    }
  }

  // Funzione per tornare al valore precedente
  const handleReset = (e: React.MouseEvent) => {
    e.preventDefault();
    if (previousValue !== undefined) onChange(previousValue);
  }

  return (
    <div className="flex flex-col gap-1 mb-4">
      <div className="flex justify-between items-end min-h-[24px]">
        <label className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {label}
        </label>
        
        {/* VISUALIZZAZIONE "ERA X" (Solo se cambiato) */}
        {hasChanged && (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
            <span className="text-xs font-bold text-orange-500 bg-orange-50 dark:bg-orange-900/30 px-1.5 py-0.5 rounded-md">
              era {previousValue}
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5 text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-full"
              onClick={handleReset}
              title={`Ripristina a ${previousValue}`}
            >
              <RotateCcw size={12} />
            </Button>
          </div>
        )}
      </div>

      <div className={cn(
        "flex items-center justify-between p-2 rounded-xl border transition-all duration-300 relative overflow-hidden",
        hasChanged 
          ? "bg-orange-50/50 border-orange-200 dark:bg-orange-900/10 dark:border-orange-800 ring-1 ring-orange-200 dark:ring-orange-800" 
          : "bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-slate-800"
      )}>
        
        {/* Indicatore visivo laterale se modificato */}
        {hasChanged && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-400" />
        )}

        <Button 
          variant="outline" size="icon" 
          className="h-12 w-12 rounded-lg border-slate-300 dark:border-slate-700 dark:text-white dark:hover:bg-slate-800 active:scale-95 bg-white dark:bg-slate-950 z-10"
          onClick={handleDecrease} disabled={value <= min}
        >
          <Minus className="h-6 w-6" />
        </Button>

        <div className="text-center min-w-[80px] z-10">
          <div className={cn(
            "text-3xl font-bold tracking-tight transition-colors",
            hasChanged ? "text-orange-600 dark:text-orange-400" : "text-slate-900 dark:text-white"
          )}>
            {value}
          </div>
          {unit && <div className="text-xs text-slate-400 font-medium">{unit}</div>}
        </div>

        <Button 
          variant="default" size="icon" 
          className="h-12 w-12 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-green-600 dark:hover:bg-green-700 active:scale-95 shadow-md z-10"
          onClick={handleIncrease} disabled={value >= max}
        >
          <Plus className="h-6 w-6 text-white" />
        </Button>
      </div>
    </div>
  )
}