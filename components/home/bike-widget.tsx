"use client"

import { useState } from "react"
import Link from "next/link"
import { setActiveBike } from "@/app/garage/actions" // Riusiamo l'azione del Garage
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Bike, Settings2, ChevronDown, PlusCircle, Gauge, Check } from "lucide-react"
import { toast } from "sonner"

interface BikeType {
  id: string
  brand: string
  model: string
  year: number
  name: string | null
  is_active: boolean
}

export function BikeWidget({ bikes }: { bikes: BikeType[] | null }) {
  const [loading, setLoading] = useState(false)
  
  // Trova la moto attiva (o null)
  const activeBike = bikes?.find(b => b.is_active) || null

  const handleSwitch = async (bikeId: string, bikeName: string) => {
    setLoading(true)
    await setActiveBike(bikeId) // Server Action
    setLoading(false)
    toast.success(`Garage aggiornato: ${bikeName}`)
  }

  return (
    <Card className="dark:bg-slate-900 dark:border-slate-800 border-l-4 border-l-green-500 shadow-sm">
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">
          Moto Attiva
        </CardTitle>
        <Link href="/garage">
           <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-green-600">
             <Settings2 size={16} />
           </Button>
        </Link>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between">
          
          {/* INFO MOTO */}
          <div className="space-y-1">
            {activeBike ? (
              <>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {activeBike.brand} {activeBike.model}
                  </h2>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Bike size={16} />
                  {activeBike.year} • "{activeBike.name}"
                </p>
              </>
            ) : (
              <div className="text-slate-400">
                <p className="text-lg font-semibold">Nessuna moto</p>
                <p className="text-xs">Aggiungi una moto nel garage</p>
              </div>
            )}
          </div>

          {/* TASTO CAMBIA (DROPDOWN) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 dark:bg-slate-950 dark:border-slate-700">
                {loading ? "..." : "Cambia"} <ChevronDown size={14} className="opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Seleziona Moto</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* Lista Moto */}
              {bikes?.map((bike) => (
                <DropdownMenuItem 
                  key={bike.id} 
                  onClick={() => handleSwitch(bike.id, bike.model)}
                  className="cursor-pointer flex justify-between items-center"
                >
                  <span>{bike.brand} {bike.model}</span>
                  {bike.is_active && <Check size={14} className="text-green-600" />}
                </DropdownMenuItem>
              ))}

              {(!bikes || bikes.length === 0) && (
                <div className="p-2 text-xs text-slate-500 text-center">Garage vuoto</div>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/garage" className="flex items-center gap-2 cursor-pointer text-green-600">
                  <PlusCircle size={14} /> Gestisci Garage
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>

        {/* Badge Stato */}
        {activeBike && (
           <div className="mt-4 flex gap-2">
             <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100 border-none">
               <Gauge size={12} className="mr-1" /> Pronto Pista
             </Badge>
           </div>
        )}
      </CardContent>
    </Card>
  )
}