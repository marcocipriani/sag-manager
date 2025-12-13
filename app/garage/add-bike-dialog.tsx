"use client"

import { useState } from "react"
import { addBike } from "./actions" // Assicurati che il nome corrisponda alla tua action
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose
} from "@/components/ui/dialog"
import { PlusCircle, Loader2, Check } from "lucide-react"
import { toast } from "sonner"
import { BIKE_COLORS } from "@/lib/bike-colors"
import { cn } from "@/lib/utils"

export function AddBikeDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Stato per il colore (Default: Slate)
  const [selectedColor, setSelectedColor] = useState("slate")

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    const result = await addBike(formData)
    setLoading(false)

    if (result?.error) {
      toast.error("Errore", { description: result.error })
    } else {
      toast.success("Moto Aggiunta!")
      setOpen(false) 
      setSelectedColor("slate") // Reset del colore al default per la prossima volta
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full h-16 border-dashed border-2 border-slate-300 dark:border-slate-700 text-slate-500 hover:border-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-slate-800 transition-all gap-2">
          <PlusCircle className="h-5 w-5" />
          Aggiungi una nuova moto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md dark:bg-slate-900 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle>Nuova Moto nel Garage</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4 py-2">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Marca</Label>
              <Input id="brand" name="brand" placeholder="Yamaha" required className="dark:bg-slate-950" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Modello</Label>
              <Input id="model" name="model" placeholder="R1" required className="dark:bg-slate-950" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">Anno</Label>
              <Input id="year" name="year" type="number" placeholder="2019" required className="dark:bg-slate-950" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input id="weight" name="weight" type="number" step="0.1" placeholder="200" className="dark:bg-slate-950" />
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
            <Label htmlFor="name">Soprannome (Opzionale)</Label>
            <Input id="name" name="name" placeholder='es. "La Bestia"' className="dark:bg-slate-950" />
          </div>

          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button variant="ghost">Annulla</Button>
            </DialogClose>
            <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
              {loading ? <Loader2 className="animate-spin" /> : "Salva Moto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}