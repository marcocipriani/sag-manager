"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { updateBike } from "./actions"

const BIKE_COLORS = [
  "bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500", 
  "bg-orange-500", "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-slate-500"
]

interface EditBikeDialogProps {
  bike: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditBikeDialog({ bike, open, onOpenChange }: EditBikeDialogProps) {
  const [loading, setLoading] = useState(false)
  const [color, setColor] = useState(bike.color || "bg-red-500")

  async function onSubmit(formData: FormData) {
    setLoading(true)
    formData.append("color", color)
    
    const res = await updateBike(bike.id, formData)
    
    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success("Moto aggiornata")
      onOpenChange(false)
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifica Moto</DialogTitle>
          <DialogDescription>Aggiorna i dettagli della moto.</DialogDescription>
        </DialogHeader>
        
        <form action={onSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Marca</Label>
              <Input id="brand" name="brand" defaultValue={bike.brand} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Modello</Label>
              <Input id="model" name="model" defaultValue={bike.model} required />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Nome (Opzionale)</Label>
            <Input id="name" name="name" defaultValue={bike.name || ""} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">Anno</Label>
              <Input id="year" name="year" type="number" defaultValue={bike.year} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input id="weight" name="weight" type="number" defaultValue={bike.weight} />
            </div>
          </div>

          <div className="space-y-3">
             <Label>Colore Identificativo</Label>
             <div className="flex flex-wrap gap-2">
               {BIKE_COLORS.map((c) => (
                 <button
                   key={c}
                   type="button"
                   onClick={() => setColor(c)}
                   className={cn(
                     "w-8 h-8 rounded-full transition-all border-2",
                     c,
                     color === c ? "border-white scale-110 shadow-lg" : "border-transparent opacity-70 hover:opacity-100"
                   )}
                 />
               ))}
             </div>
          </div>

          <DialogFooter className="mt-4">
             <Button type="submit" disabled={loading} className="w-full bg-slate-900 text-white dark:bg-white dark:text-black">
               {loading ? <Loader2 className="animate-spin" /> : "Salva Modifiche"}
             </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}