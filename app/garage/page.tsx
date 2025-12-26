import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { PageLayout } from "@/components/layout/page-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AddBikeDialog } from "./add-bike-dialog"
import { BikeCardMenu } from "./bike-card-menu"
import { setActiveBike } from "./actions"
import { Weight, Loader2, Plus, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

async function GarageContent() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: bikes } = await supabase
    .from('bikes')
    .select('*')
    .eq('user_id', user?.id)
    .order('is_active', { ascending: false })
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        {bikes?.map((bike) => (
          <Card 
            key={bike.id} 
            className={cn(
              "overflow-hidden transition-all dark:bg-slate-950 border-0 shadow-md group",
              bike.is_active ? "ring-1 ring-green-500" : ""
            )}
          >
            <CardContent className="p-0">
              <div className="flex h-full min-h-[140px]">
                
                {/* Fascia colorata laterale */}
                <div className={cn("w-3 shrink-0", bike.color || "bg-slate-500")} />

                {/* Contenitore principale (Relative per posizionare il menu) */}
                <div className="flex-1 flex flex-col bg-slate-900/40 relative">
                  
                  {/* MENU ASSOLUTO IN ALTO A DESTRA */}
                  <div className="absolute top-2 right-2 z-10">
                    <BikeCardMenu bike={bike} />
                  </div>

                  {/* PARTE SUPERIORE: Badge e Titolo */}
                  <div className="p-4 pb-5 flex-1 flex flex-col justify-center">
                    
                    {/* Renderizza il Badge solo se attivo (occupa spazio solo se presente) */}
                    {bike.is_active && (
                      <div className="mb-2">
                        <Badge className="bg-green-900/30 text-green-400 border-none text-[10px] px-2 py-0.5 rounded-sm uppercase font-bold tracking-wider">
                          IN USO
                        </Badge>
                      </div>
                    )}

                    {/* Titolo Moto */}
                    <div className="pr-8"> {/* Padding right per evitare sovrapposizione col menu */}
                      <h3 className="font-bold text-xl text-white leading-tight">
                        {bike.brand} {bike.model} 
                        <span className="text-slate-500 text-base font-normal ml-2">{bike.year}</span>
                      </h3>
                      {bike.name && <p className="text-sm text-slate-400 mt-1 font-medium">"{bike.name}"</p>}
                    </div>
                  </div>

                  {/* DIVIDER */}
                  <div className="h-px w-full bg-slate-800" />

                  {/* FOOTER */}
                  <div className="flex justify-between items-center p-3 px-4 bg-slate-900/80">
                    <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
                      <Weight size={16} />
                      {bike.weight ? <span>{bike.weight} kg</span> : <span>-</span>}
                    </div>

                    <div className="flex items-center gap-3">
                      {!bike.is_active && (
                        <form action={async () => {
                          "use server"
                          await setActiveBike(bike.id)
                        }}>
                          <button className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white uppercase transition-colors">
                             <CheckCircle2 size={16} /> USA QUESTA
                          </button>
                        </form>
                      )}
                      <div className={cn("w-2 h-2 rounded-full", bike.color || "bg-slate-500")} />
                    </div>
                  </div>

                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AddBikeDialog>
        <Button 
          variant="outline" 
          className="w-full h-16 border-dashed border-slate-800 bg-transparent text-slate-500 hover:text-white hover:bg-slate-900 hover:border-slate-600 flex items-center gap-2 text-base transition-colors"
        >
          <Plus className="h-5 w-5" /> Aggiungi una nuova moto
        </Button>
      </AddBikeDialog>
    </div>
  )
}

export default function GaragePage() {
  return (
    <PageLayout 
      title="Il mio Garage" 
      showBackButton={true}
      rightAction={
        <AddBikeDialog>
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
            <Plus size={20} />
          </Button>
        </AddBikeDialog>
      }
    >

      <Suspense fallback={
        <div className="flex flex-col items-center justify-center pt-20 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin text-green-600 mb-2" />
          <p className="text-sm">Caricamento Garage...</p>
        </div>
      }>
        <GarageContent />
      </Suspense>
    </PageLayout>
  )
}