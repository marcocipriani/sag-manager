"use client"

import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"

interface StepperProps {
  label: string
  value: number
  unit?: string
  step?: number
  min?: number
  max?: number
  onChange: (val: number) => void
}

export function Stepper({ 
  label, 
  value, 
  unit = "", 
  step = 1, 
  min = 0,
  max = 999,
  onChange 
}: StepperProps) {
  
  const handleDecrease = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form to be sent clicking on button
    if (value - step >= min) {
      // rounding up
      onChange(Math.round((value - step) * 100) / 100)
    }
  }

  const handleIncrease = (e: React.MouseEvent) => {
    e.preventDefault();
    if (value + step <= max) {
      onChange(Math.round((value + step) * 100) / 100)
    }
  }

  return (
    <div className="flex flex-col gap-1 mb-4">
      <label className="text-sm font-medium text-slate-500 uppercase tracking-wider">
        {label}
      </label>
      <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-200">
        
        {/* Decrease */}
        <Button 
          variant="outline" 
          size="icon" 
          className="h-12 w-12 rounded-lg border-slate-300 active:scale-95 transition-transform"
          onClick={handleDecrease}
          disabled={value <= min}
        >
          <Minus className="h-6 w-6 text-slate-700" />
        </Button>

        {/* Value */}
        <div className="text-center w-24">
          <div className="text-3xl font-bold text-slate-900 tracking-tight">{value}</div>
          {unit && <div className="text-xs text-slate-400 font-medium">{unit}</div>}
        </div>

        {/* Increase */}
        <Button 
          variant="default" 
          size="icon" 
          className="h-12 w-12 rounded-lg bg-slate-900 hover:bg-slate-800 active:scale-95 transition-transform shadow-md"
          onClick={handleIncrease}
          disabled={value >= max}
        >
          <Plus className="h-6 w-6 text-white" />
        </Button>
      </div>
    </div>
  )
}