"use client"

import { useEffect, useState } from "react"
import { Stepper } from "@/components/ui/stepper"
import { Card } from "@/components/ui/card"
import { Bike, User, ArrowDownToLine, ArrowUpFromLine } from "lucide-react"

interface SagCalculatorProps {
  type: "fork" | "shock"
  initialL1?: number
  initialL2?: number
  initialL3?: number
  // NUOVI PROPS: I valori di riferimento (dalla sessione precedente)
  referenceL1?: number
  referenceL2?: number
  referenceL3?: number
  onChange: (staticSag: number, riderSag: number, measurements: { l1: number, l2: number, l3: number }) => void
}

export function SagCalculator({ 
  type, 
  initialL1, initialL2, initialL3, 
  referenceL1, referenceL2, referenceL3, // <--- Li recuperiamo qui
  onChange 
}: SagCalculatorProps) {
  const [l1, setL1] = useState<number>(initialL1 || 0)
  const [l2, setL2] = useState<number>(initialL2 || 0)
  const [l3, setL3] = useState<number>(initialL3 || 0)

  const staticSag = l1 - l2
  const riderSag = l1 - l3

  useEffect(() => {
    onChange(staticSag, riderSag, { l1, l2, l3 })
  }, [l1, l2, l3, staticSag, riderSag])

  const isFork = type === 'fork'

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-1.5 rounded-md ${isFork ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'}`}>
          {isFork ? <ArrowDownToLine size={16} /> : <ArrowUpFromLine size={16} />}
        </div>
        <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Calcolo SAG {isFork ? 'Forcella' : 'Mono'}
        </h3>
      </div>
      
      <div className="space-y-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <Stepper 
          label="L1 - Moto Alzata (Estesa)" 
          value={l1} 
          previousValue={referenceL1} // <--- Passiamo il riferimento
          min={0} max={1000} step={1} unit="mm" onChange={setL1} 
        />
        <Stepper 
          label="L2 - Moto a Terra (Statica)" 
          value={l2} 
          previousValue={referenceL2} // <--- Passiamo il riferimento
          min={0} max={1000} step={1} unit="mm" onChange={setL2} 
        />
        <Stepper 
          label="L3 - Con Pilota (Rider)" 
          value={l3} 
          previousValue={referenceL3} // <--- Passiamo il riferimento
          min={0} max={1000} step={1} unit="mm" onChange={setL3} 
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* STATIC SAG */}
        <Card className="p-3 border-l-4 border-l-slate-400 dark:bg-slate-900 shadow-sm relative overflow-hidden">
          <div className="absolute right-2 top-2 opacity-10"><Bike size={40} /></div>
          <div className="flex flex-col relative z-10">
            <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
              <Bike size={12} /> Static Sag
            </span>
            <div className={`text-2xl font-bold font-mono mt-1 ${staticSag < 0 ? 'text-red-500' : 'text-slate-800 dark:text-slate-100'}`}>
              {staticSag} <span className="text-xs font-normal text-slate-400">mm</span>
            </div>
          </div>
        </Card>
        {/* RIDER SAG */}
        <Card className="p-3 border-l-4 border-l-green-500 dark:bg-slate-900 shadow-sm relative overflow-hidden">
          <div className="absolute right-2 top-2 opacity-10"><User size={40} /></div>
          <div className="flex flex-col relative z-10">
            <span className="text-[10px] uppercase font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
              <User size={12} /> Rider Sag
            </span>
            <div className={`text-2xl font-bold font-mono mt-1 ${riderSag < 0 ? 'text-red-500' : 'text-slate-800 dark:text-slate-100'}`}>
              {riderSag} <span className="text-xs font-normal text-slate-400">mm</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}