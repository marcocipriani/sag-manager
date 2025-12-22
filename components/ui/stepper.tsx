"use client"

import * as React from "react"
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
  max = 9999,
  onChange 
}: StepperProps) {
  
  // --- STATO PER EDIT MANUALE ---
  const [isEditing, setIsEditing] = React.useState(false)
  const [inputValue, setInputValue] = React.useState(value.toString())
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Sincronizza lo stato locale quando il valore cambia dall'esterno (es. reset o pulsanti)
  React.useEffect(() => {
    setInputValue(value.toString())
  }, [value])

  // Focus automatico quando si clicca sul numero
  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  // --- LOGICA DI CONFRONTO (Fixed) ---
  // Usiamo Math.abs per evitare bug coi float (es. 2.1 !== 2.100000004)
  const hasChanged = previousValue !== undefined && Math.abs(value - previousValue) > 0.001

  // --- HANDLERS ---
  const handleDecrease = (e: React.MouseEvent) => {
    e.preventDefault() // Evita focus indesiderati
    if (value - step >= min) {
      const newVal = Math.round((value - step) * 100) / 100
      onChange(newVal)
    }
  }

  const handleIncrease = (e: React.MouseEvent) => {
    e.preventDefault()
    if (value + step <= max) {
      const newVal = Math.round((value + step) * 100) / 100
      onChange(newVal)
    }
  }

  const handleReset = (e: React.MouseEvent) => {
    e.preventDefault()
    if (previousValue !== undefined) onChange(previousValue)
  }

  // Salvataggio Input Manuale
  const handleSaveInput = () => {
    let newValue = parseFloat(inputValue.replace(',', '.'))
    
    if (isNaN(newValue)) {
      setInputValue(value.toString()) // Revert se non valido
    } else {
      // Clamp min/max
      if (newValue < min) newValue = min
      if (newValue > max) newValue = max
      
      // Arrotonda in base allo step per pulizia
      // (es. se step è 0.1, arrotonda al decimale)
      const precision = step.toString().split(".")[1]?.length || 0
      const factor = Math.pow(10, precision)
      newValue = Math.round(newValue * factor) / factor

      onChange(newValue)
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveInput()
    }
  }

  return (
    <div className="flex flex-col gap-1 mb-4">
      
      {/* HEADER: LABEL + RESET */}
      <div className="flex justify-between items-end min-h-[24px]">
        <label className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {label}
        </label>
        
        {/* VISUALIZZAZIONE "ERA X" (Solo se cambiato) */}
        {hasChanged && (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
            <span className="text-xs font-bold text-orange-500 bg-orange-50 dark:bg-orange-900/30 px-1.5 py-0.5 rounded-md border border-orange-100 dark:border-orange-800">
              era {previousValue}
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-full"
              onClick={handleReset}
              title={`Ripristina a ${previousValue}`}
              type="button"
            >
              <RotateCcw size={12} />
            </Button>
          </div>
        )}
      </div>

      {/* CONTENITORE PRINCIPALE STILE "LARGE" */}
      <div className={cn(
        "flex items-center justify-between p-2 rounded-xl border transition-all duration-300 relative overflow-hidden shadow-sm",
        hasChanged 
          ? "bg-orange-50/50 border-orange-300 dark:bg-orange-900/10 dark:border-orange-700 ring-1 ring-orange-200 dark:ring-orange-800/50" 
          : "bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-slate-800"
      )}>
        
        {/* Barra laterale arancione se modificato */}
        {hasChanged && (
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-orange-400 dark:bg-orange-500 z-0" />
        )}

        {/* TASTO MENO */}
        <Button 
          variant="outline" size="icon" 
          className="h-12 w-12 rounded-lg border-slate-300 dark:border-slate-700 dark:text-white dark:hover:bg-slate-800 active:scale-95 bg-white dark:bg-slate-950 z-10 shrink-0"
          onClick={handleDecrease} disabled={value <= min}
          type="button"
        >
          <Minus className="h-6 w-6" />
        </Button>

        {/* ZONA CENTRALE (DISPLAY / INPUT) */}
        <div 
          className="flex-1 text-center z-10 mx-2 cursor-text group" 
          onClick={() => setIsEditing(true)}
        >
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              inputMode="decimal"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={handleSaveInput}
              onKeyDown={handleKeyDown}
              className={cn(
                "w-full bg-transparent text-center text-3xl font-bold tracking-tight outline-none border-b-2 border-slate-400 pb-1",
                hasChanged ? "text-orange-600 dark:text-orange-400" : "text-slate-900 dark:text-white"
              )}
            />
          ) : (
            <div className="flex flex-col items-center justify-center select-none group-hover:scale-105 transition-transform">
              <div className={cn(
                "text-3xl font-bold tracking-tight transition-colors",
                hasChanged ? "text-orange-600 dark:text-orange-400" : "text-slate-900 dark:text-white"
              )}>
                {value}
              </div>
              {unit && <div className="text-xs text-slate-400 font-medium -mt-1">{unit}</div>}
            </div>
          )}
        </div>

        {/* TASTO PIU' */}
        <Button 
          variant="default" size="icon" 
          className="h-12 w-12 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-green-600 dark:hover:bg-green-700 active:scale-95 shadow-md z-10 shrink-0"
          onClick={handleIncrease} disabled={value >= max}
          type="button"
        >
          <Plus className="h-6 w-6 text-white" />
        </Button>
      </div>
    </div>
  )
}