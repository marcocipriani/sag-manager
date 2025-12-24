"use client"

import { useState } from "react"
import { toast } from "sonner"
import { MoreVertical, Trash2, Edit, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { EditBikeDialog } from "./edit-bike-dialog"
import { deleteBike } from "./actions"

export function BikeCardMenu({ bike }: { bike: any }) {
  const [editOpen, setEditOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if(!confirm("Sei sicuro di voler eliminare questa moto?")) return
    setLoading(true)
    const res = await deleteBike(bike.id)
    if (res?.error) toast.error(res.error)
    else toast.success("Moto eliminata")
    setLoading(false)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
            {loading ? <Loader2 size={16} className="animate-spin"/> : <MoreVertical size={18} />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="dark:bg-slate-950 border-slate-800 text-slate-300">
          <DropdownMenuItem onClick={() => setEditOpen(true)} className="cursor-pointer gap-2 focus:bg-slate-900 focus:text-white">
            <Edit size={16} /> Modifica
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete} className="cursor-pointer text-red-500 focus:text-red-400 focus:bg-red-950/20 gap-2">
            <Trash2 size={16} /> Elimina Moto
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditBikeDialog bike={bike} open={editOpen} onOpenChange={setEditOpen} />
    </>
  )
}