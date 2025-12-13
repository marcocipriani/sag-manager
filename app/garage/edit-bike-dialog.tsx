"use client"

import { useState } from "react"
import { updateBike } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose
} from "@/components/ui/dialog"
import { Loader2, Check } from "lucide-react"
import { toast } from "sonner"
import { BIKE_COLORS } from "@/lib/bike-colors"
import { cn } from "@/lib/utils"

interface BikeData {
  id: string
  brand: string
  model: string
  year: number
  name: string | null
  weight: number | null
  color: string | null
}

interface EditBikeDialogProps {
  bike: BikeData
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditBikeDialog({ bike, open, onOpenChange }: EditBikeDialogProps) {
  const [loading, setLoading] = useState(false)
  
  // Inizializza con il colore attuale della moto, oppure 'slate' se non ne ha uno
  const [selectedColor, setSelectedColor] = useState(bike.color || "slate")

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    // Passiamo l'ID della moto e i dati del form
    const result = await updateBike(bike.id, formData)
    setLoading(false)

    if (result?.error) {
      toast.error("Errore", { description: result.error })
    } else {
      toast.success("Moto aggiornata!")
      onOpenChange(false) // Chiude il modal
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md dark:bg-slate-900 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle>Modifica Moto</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4 py-2">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Marca</Label>
              <Input id="brand" name="brand" defaultValue={bike.brand} required className="dark:bg-slate-950" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Modello</Label>
              <Input id="model" name="model" defaultValue={bike.model} required className="dark:bg-slate-950" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">Anno</Label>
              <Input id="year" name="year" type="number" defaultValue={bike.year} required className="dark:bg-slate-950" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input id="weight" name="weight" type="number" step="0.1" defaultValue={bike.weight || ""} className="dark:bg-slate-950" />
            </div>
          </div>

          {/* SELETTORE COLORE */}
          <div className="space-y-2">
            <Label>Colore Identificativo</Label>
            {/* Input nascosto per passare il valore alla Server Action */}
            <input type="hidden" name="color" value={selectedColor} />
            
            <div className="flex flex-wrap gap-2">
              {BIKE_COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedColor(c.id)}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-all border-2",
                    c.class, // Colore sfondo
                    selectedColor === c.id 
                      ? "border-white dark:border-slate-200 ring-2 ring-slate-400 scale-110 shadow-sm" 
                      : "border-transparent opacity-70 hover:opacity-100 hover:scale-105"
                  )}
                  title={c.label}
                >
                  {selectedColor === c.id && <Check size={14} className="text-white drop-shadow-md" />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Soprannome</Label>
            <Input id="name" name="name" defaultValue={bike.name || ""} placeholder='es. "La Bestia"' className="dark:bg-slate-950" />
          </div>

          <DialogFooter className="pt-4">
            <Button variant="ghost" type="button" onClick={() => onOpenChange(false)}>Annulla</Button>
            <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
              {loading ? <Loader2 className="animate-spin" /> : "Salva Modifiche"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}