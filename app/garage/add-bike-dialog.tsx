"use client"

import { useState } from "react"
import { addBike } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose
} from "@/components/ui/dialog"
import { PlusCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"

export function AddBikeDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    const result = await addBike(formData)
    setLoading(false)

    if (result?.error) {
      toast.error("Errore", { description: result.error })
    } else {
      toast.success("Moto Aggiunta!")
      setOpen(false) // Chiude il modal
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