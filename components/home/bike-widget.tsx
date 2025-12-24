"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Check, ChevronDown, Warehouse, Bike as BikeIcon, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command"
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover"

interface Bike {
  id: string
  brand: string
  model: string
  color: string | null
  year?: number
  name?: string | null
  is_active: boolean
}

interface BikeWidgetProps {
  bikes: Bike[]
}

export function BikeWidget({ bikes }: BikeWidgetProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const activeBike = bikes.find((bike) => bike.is_active)

  const handleSelect = async (bikeId: string) => {
    setOpen(false)
    if (activeBike && bikeId === activeBike.id) return

    try {
       await supabase.from('bikes').update({ is_active: false }).neq('id', bikeId)
       const { error } = await supabase.from('bikes').update({ is_active: true }).eq('id', bikeId)
       if (error) throw error
       toast.success("Moto attiva cambiata")
       router.refresh()
    } catch (e) {
       toast.error("Errore cambio moto")
    }
  }

  return (
    <Card className="dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
      <CardContent className="p-0">
        <div className="flex min-h-[130px]">

          <div className={cn("w-3 shrink-0", activeBike?.color || "bg-slate-500")} />

          <div className="flex-1 p-5 flex flex-col justify-between">

            <div className="flex items-center gap-2 mb-2">
              <BikeIcon size={16} className="text-green-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Moto Attiva
              </span>
            </div>

            {activeBike ? (
              <>
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-none">
                    {activeBike.brand} {activeBike.model}
                  </h2>
                  {activeBike.name && (
                    <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                      "{activeBike.name}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-auto">

                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-9">
                        Cambia <ChevronDown size={14} className="opacity-50"/>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[250px] p-0 dark:bg-slate-900 border-slate-800" align="start">
                      <Command>
                        <CommandInput placeholder="Cerca moto..." />
                        <CommandList>
                          <CommandEmpty>Nessuna moto.</CommandEmpty>
                          <CommandGroup heading="Garage">
                            {bikes.map((bike) => (
                              <CommandItem key={bike.id} value={`${bike.brand} ${bike.model}`} onSelect={() => handleSelect(bike.id)} className="cursor-pointer">
                                <div className={cn("w-2 h-2 rounded-full mr-2", bike.color || "bg-slate-500")} />
                                <span className="flex-1">{bike.brand} {bike.model}</span>
                                {activeBike.id === bike.id && <Check className="ml-auto h-3 w-3 text-green-500" />}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                          <CommandGroup>
                             <CommandItem onSelect={() => router.push('/garage')} className="text-green-500 font-medium cursor-pointer">
                                <Plus className="mr-2 h-3 w-3" /> Gestisci Garage
                             </CommandItem>
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-9 gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    onClick={() => router.push('/garage')}
                  >
                    <Warehouse size={16} /> Garage
                  </Button>

                </div>
              </>
            ) : (
              <div className="text-center py-2">
                <p className="text-sm text-slate-500 mb-3">Nessuna moto selezionata</p>
                <Button onClick={() => router.push('/garage')} variant="outline" className="w-full">
                  Seleziona dal Garage
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}