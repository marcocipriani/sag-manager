"use client"

import { useState } from "react"
import { saveCircuit } from "./actions"
import { createClient } from "@/lib/supabase/client" // Serve per l'upload
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog"
import { Loader2, Upload, ImageIcon } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

interface TrackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  circuit?: any
}

export function TrackDialog({ open, onOpenChange, circuit }: TrackDialogProps) {
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(circuit?.map_image_url || null)

  const supabase = createClient()

  // Gestione anteprima immagine locale
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      setFile(selected)
      setPreview(URL.createObjectURL(selected))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(e.currentTarget)
    
    try {
      let imageUrl = circuit?.map_image_url

      // 1. UPLOAD IMMAGINE (Se selezionata)
      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('track-maps')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('track-maps')
          .getPublicUrl(filePath)
          
        imageUrl = publicUrl
      }

      if (imageUrl) {
        formData.append("map_image_url", imageUrl)
      }

      // 2. SALVATAGGIO DATI
      const result = await saveCircuit(formData, circuit?.id)
      
      if (result?.error) {
        toast.error("Errore", { description: result.error })
      } else {
        toast.success(circuit ? "Circuito aggiornato" : "Circuito aggiunto")
        onOpenChange(false)
        setFile(null) // Reset
      }
    } catch (error: any) {
      toast.error("Errore upload", { description: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md dark:bg-slate-900 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{circuit ? "Modifica Circuito" : "Nuovo Circuito"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          
          {/* UPLOAD LAYOUT */}
          <div className="flex justify-center mb-4">
            <div className="relative w-full h-40 bg-slate-100 dark:bg-slate-950 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center overflow-hidden group hover:border-green-500 transition-colors cursor-pointer">
              
              {preview ? (
                <Image src={preview} alt="Preview" fill className="object-contain p-2" />
              ) : (
                <div className="text-center text-slate-400">
                  <ImageIcon className="mx-auto mb-2 opacity-50" />
                  <span className="text-xs">Carica Layout Tracciato</span>
                </div>
              )}
              
              <Input 
                type="file" 
                accept="image/*" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                onChange={handleFileChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Circuito *</Label>
              <Input id="name" name="name" defaultValue={circuit?.name} placeholder="Mugello" required className="dark:bg-slate-950" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Località</Label>
              <Input id="location" name="location" defaultValue={circuit?.location} placeholder="Scarperia (FI)" className="dark:bg-slate-950" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
             <div className="space-y-2">
              <Label htmlFor="length">Lunghezza (m)</Label>
              <Input id="length" name="length" type="number" defaultValue={circuit?.length_meters} placeholder="5245" className="dark:bg-slate-950" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="best_lap">Best Lap</Label>
              <Input id="best_lap" name="best_lap" defaultValue={circuit?.best_lap} placeholder="1:58.3" className="dark:bg-slate-950" />
            </div>
             <div className="space-y-2">
              <Label htmlFor="gearing">Rapporti</Label>
              <Input id="gearing" name="gearing" defaultValue={circuit?.gearing} placeholder="16-43" className="dark:bg-slate-950" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Note</Label>
            <Textarea id="notes" name="notes" defaultValue={circuit?.notes} placeholder="Note sulla pista..." className="dark:bg-slate-950" />
          </div>

          <DialogFooter className="pt-2">
            <Button variant="ghost" type="button" onClick={() => onOpenChange(false)}>Annulla</Button>
            <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
              {loading ? <Loader2 className="animate-spin" /> : "Salva"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}