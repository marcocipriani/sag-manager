"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { createBike } from "./actions"

const BIKE_COLORS = [
  "bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500", 
  "bg-orange-500", "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-slate-500"
]

export function AddBikeDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [color, setColor] = useState("bg-red-500")

  async function onSubmit(formData: FormData) {
    setLoading(true)
    formData.append("color", color)
    
    const res = await createBike(formData)
    
    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success("Moto aggiunta")
      setOpen(false)
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nuova Moto</DialogTitle>
          <DialogDescription>Inserisci i dettagli della tua moto.</DialogDescription>
        </DialogHeader>
        
        <form action={onSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Marca</Label>
              <Input id="brand" name="brand" placeholder="Yamaha" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Modello</Label>
              <Input id="model" name="model" placeholder="R1" required />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Nome (Opzionale)</Label>
            <Input id="name" name="name" placeholder='Es: "La Bestia"' />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">Anno</Label>
              <Input id="year" name="year" type="number" placeholder="2024" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input id="weight" name="weight" type="number" placeholder="180" />
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
             <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white">
               {loading ? <Loader2 className="animate-spin" /> : "Salva Moto"}
             </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}