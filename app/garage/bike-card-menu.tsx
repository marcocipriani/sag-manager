// src/app/garage/bike-card-menu.tsx
"use client"

import { useState } from "react"
import { deleteBike, setActiveBike } from "./actions"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Trash2, CheckCircle2, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface BikeCardMenuProps {
  bikeId: string
  isActive: boolean
}

export function BikeCardMenu({ bikeId, isActive }: BikeCardMenuProps) {
  const [loading, setLoading] = useState(false)

  // Gestione Eliminazione
  const handleDelete = async () => {
    if (!confirm("Vuoi davvero eliminare questa moto?")) return
    
    setLoading(true)
    const result = await deleteBike(bikeId)
    setLoading(false)

    if (result?.error) {
      toast.error("Errore", { description: result.error })
    } else {
      toast.success("Moto eliminata")
    }
  }

  // Gestione Attivazione
  const handleSetActive = async () => {
    setLoading(true)
    await setActiveBike(bikeId)
    setLoading(false)
    toast.success("Moto selezionata come attiva")
  }

  return (
    <div className="flex items-center gap-2">
      {/* Tasto Rapido "USA QUESTA" (visibile solo se non attiva) */}
      {!isActive && (
        <Button 
          variant="link" 
          size="sm" 
          onClick={handleSetActive}
          disabled={loading}
          className="h-auto p-0 text-slate-500 hover:text-green-600 dark:text-slate-400 dark:hover:text-green-400 text-xs font-bold gap-1 mr-2"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
          USA QUESTA
        </Button>
      )}

      {/* Menu a Tendina */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-slate-400">
            <MoreVertical size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleDelete} className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20">
            <Trash2 size={14} className="mr-2" />
            Elimina Moto
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}