"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose
} from "@/components/ui/dialog"
import { User, Loader2, Upload } from "lucide-react"
import { toast } from "sonner"

interface EditProfileProps {
  currentName: string | null
  currentAvatar: string | null
  onProfileUpdate: (newName: string, newAvatarUrl: string | null) => void 
}

export function EditProfileDialog({ currentName, currentAvatar, onProfileUpdate }: EditProfileProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(currentName || "")
  const [file, setFile] = useState<File | null>(null)
  
  const supabase = createClient()
  const router = useRouter()

  const handleSave = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    let avatarUrl = currentAvatar

    try {
      // 1. Upload immagine (se presente)
      if (file) {
        const fileExt = file.name.split('.').pop()
        const filePath = `${user.id}/${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath)

        avatarUrl = publicUrl
      }

      // 2. Aggiornamento Auth
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: name,
          avatar_url: avatarUrl,
          picture: avatarUrl
        }
      })

      if (updateError) throw updateError

      toast.success("Profilo aggiornato!")
      
      // 3. AVVISA IL PADRE DELL'AGGIORNAMENTO
      onProfileUpdate(name, avatarUrl)

      setOpen(false)
      router.refresh() // Aggiorna anche i componenti server (header, ecc.)
      
    } catch (error: any) {
      console.error(error)
      toast.error("Errore", { description: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start gap-2 dark:border-slate-700 dark:text-slate-200">
          <User size={16} /> Modifica Profilo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md dark:bg-slate-900 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle>Modifica Profilo</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Visualizzato</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="dark:bg-slate-950"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar">Nuova Immagine</Label>
            <div className="flex items-center gap-2">
              <Input 
                id="avatar" 
                type="file" 
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="dark:bg-slate-950 cursor-pointer"
              />
              <Upload size={20} className="text-slate-400" />
            </div>
            <p className="text-[10px] text-slate-500">JPG, PNG o WEBP. Max 2MB.</p>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" disabled={loading}>Annulla</Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
            {loading ? <Loader2 className="animate-spin" /> : "Salva Modifiche"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}