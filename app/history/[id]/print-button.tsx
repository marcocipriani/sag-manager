"use client"

import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

export function PrintButton() {
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={() => window.print()}
      className="text-slate-400 hover:text-white hover:bg-slate-800 gap-2"
    >
      <Printer size={18} />
      <span className="hidden sm:inline font-medium">Stampa Scheda</span>
    </Button>
  )
}