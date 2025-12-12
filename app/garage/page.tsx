import { createClient } from "@/lib/supabase/server"
import { PageLayout } from "@/components/layout/page-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AddBikeDialog } from "./add-bike-dialog"
import { BikeCardMenu } from "./bike-card-menu"
import { Weight } from "lucide-react"

export default async function GaragePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: bikes } = await supabase
    .from('bikes')
    .select('*')
    .eq('user_id', user?.id)
    .order('is_active', { ascending: false })
    .order('created_at', { ascending: false })

  return (
    <PageLayout title="Garage">
      <div className="space-y-4">
        
        {bikes?.map((bike) => (
          <Card 
            key={bike.id} 
            className={`
              relative overflow-hidden transition-all border-slate-200 dark:border-slate-800 dark:bg-slate-900
              ${bike.is_active ? 'ring-2 ring-green-500 border-transparent dark:border-transparent shadow-md' : 'hover:border-slate-300 dark:hover:border-slate-700'}
            `}
          >
            <CardContent className="p-0">
              <div className="flex h-full">
                
                {/* Banda Colorata */}
                <div className={`w-2 ${bike.is_active ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
                
                <div className="flex-1 p-4 pl-3">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      {bike.is_active && (
                        <Badge variant="secondary" className="mb-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100 border-none text-[10px] px-2 h-5">
                          IN USO
                        </Badge>
                      )}
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-none mb-1">
                        {bike.brand} {bike.model} <span className="text-slate-400 font-normal text-sm">{bike.year}</span>
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">"{bike.name}"</p>
                    </div>
                    
                    {/* MENU AZIONI (Gestisce Elimina e Seleziona) */}
                    <BikeCardMenu bikeId={bike.id} isActive={bike.is_active || false} />
                    
                  </div>

                  <div className="flex gap-4 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 items-center">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                      <Weight size={14} className="text-slate-400" />
                      {bike.weight ? `${bike.weight} kg` : 'N/D'}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <AddBikeDialog />

      </div>
    </PageLayout>
  )
}