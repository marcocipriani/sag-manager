"use client"

import { useState } from "react"
import { updateBike } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose
} from "@/components/ui/dialog"
import { Loader2, Pencil } from "lucide-react"
import { toast } from "sonner"

// Definiamo il tipo per la moto
interface BikeData {
  id: string
  brand: string
  model: string
  year: number
  name: string | null
  weight: number | null
}

interface EditBikeDialogProps {
  bike: BikeData
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditBikeDialog({ bike, open, onOpenChange }: EditBikeDialogProps) {
  const [loading, setLoading] = useState(false)

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