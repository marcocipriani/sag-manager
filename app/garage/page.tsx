// src/app/garage/page.tsx
"use client"

import { PageLayout } from "@/components/layout/page-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Plus,
  PlusCircle,
  Bike, 
  Settings, 
  MoreVertical,
  Weight
} from "lucide-react"

// MOCK DATA: Le tue moto
const bikes = [
  {
    id: 1,
    name: "La Bestia",
    model: "Yamaha R1",
    year: 2019,
    weight: "201 kg",
    active: true, // Questa è la moto selezionata
    color: "bg-blue-600"
  },
  {
    id: 2,
    name: "Muletto",
    model: "Honda CBR 600RR",
    year: 2008,
    weight: "185 kg",
    active: false,
    color: "bg-red-600"
  }
]

export default function GaragePage() {
  
  // Header Action: Add Bike Button
  const addBikeButton = (
    <Button size="icon" variant="ghost" className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20">
      <Plus size={24} />
    </Button>
  )

  return (
    <PageLayout title="Garage" action={addBikeButton}>
      
      <div className="space-y-4">
        {bikes.map((bike) => (
          <Card 
            key={bike.id} 
            className={`
              relative overflow-hidden transition-all border-slate-200 dark:border-slate-800 dark:bg-slate-900
              ${bike.active ? 'ring-2 ring-green-500 border-transparent dark:border-transparent shadow-md' : 'hover:border-slate-300 dark:hover:border-slate-700'}
            `}
          >
            <CardContent className="p-0">
              <div className="flex h-full">
                
                {/* Colored Stripe / Active Indicator */}
                <div className={`w-2 ${bike.active ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
                
                <div className="flex-1 p-4 pl-3">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      {bike.active && (
                        <Badge variant="secondary" className="mb-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100 border-none text-[10px] px-2 h-5">
                          IN USO
                        </Badge>
                      )}
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-none mb-1">
                        {bike.model} <span className="text-slate-400 font-normal text-sm">{bike.year}</span>
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">"{bike.name}"</p>
                    </div>
                    
                    <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-slate-400">
                      <MoreVertical size={16} />
                    </Button>
                  </div>

                  {/* Bike Specs Mini-Grid */}
                  <div className="flex gap-4 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                      <Weight size={14} className="text-slate-400" />
                      {bike.weight}
                    </div>
                    
                    {/* Pulsante rapido per setup (opzionale) */}
                    <div className="ml-auto">
                       {!bike.active && (
                         <Button variant="link" size="sm" className="h-auto p-0 text-green-600 dark:text-green-400 text-xs font-bold">
                           SELEZIONA
                         </Button>
                       )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Empty State / Add New Card */}
        <Button variant="outline" className="w-full h-16 border-dashed border-2 border-slate-300 dark:border-slate-700 text-slate-500 hover:border-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-slate-800 transition-all gap-2">
          <PlusCircle className="h-5 w-5" />
          Aggiungi una nuova moto
        </Button>

      </div>
    </PageLayout>
  )
}