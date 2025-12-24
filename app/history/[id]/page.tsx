import { Suspense } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PageLayout } from "@/components/layout/page-layout"
import { 
  Card, CardContent, CardHeader, CardTitle 
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Calendar, Clock, MapPin, Gauge, ChevronLeft, ChevronRight, 
  ArrowDownToLine, ArrowUpFromLine, Disc, ClipboardList, Timer, User, Shirt, Bike 
} from "lucide-react"

import { PrintButton } from "./print-button" 

const Val = ({ v, unit }: { v: any, unit?: string }) => {
  if (v === null || v === undefined || v === "") return <span className="text-slate-300">-</span>
  return <span className="font-mono font-bold text-slate-900 dark:text-white">{v} {unit}</span>
}

const Row = ({ label, v, unit }: { label: string, v: any, unit?: string }) => (
  <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800 last:border-0">
    <span className="text-xs text-slate-500 uppercase">{label}</span>
    <Val v={v} unit={unit} />
  </div>
)

function CardDetail({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <Card className="dark:bg-slate-900 dark:border-slate-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold uppercase text-slate-500 tracking-wider">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-0">
        {children}
      </CardContent>
    </Card>
  )
}

function SagCard({ label, value, icon }: { label: string, value: any, icon: any }) {
  return (
    <Card className="dark:bg-slate-900 dark:border-slate-800 border-l-4 border-l-blue-500">
      <CardContent className="p-3">
        <div className="text-[10px] uppercase text-slate-500 flex items-center gap-1 mb-1">
          {icon} {label}
        </div>
        <div className="text-xl font-mono font-bold text-slate-900 dark:text-white">
          {value || "-"} <span className="text-xs font-sans font-normal text-slate-400">mm</span>
        </div>
      </CardContent>
    </Card>
  )
}

async function SessionDetail({ id }: { id: string }) {
  const supabase = await createClient()
  
  const { data: session } = await supabase
    .from('sessions')
    .select(`
      *,
      track_days ( date, circuit_name, rider_weight, bike:bikes ( brand, model, color ) )
    `)
    .eq('id', id)
    .single()

  if (!session) return notFound()

  const { data: prevSession } = await supabase
    .from('sessions')
    .select('id')
    .lt('created_at', session.created_at)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data: nextSession } = await supabase
    .from('sessions')
    .select('id')
    .gt('created_at', session.created_at)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  const riderWeight = session.track_days?.rider_weight || 0
  const gearWeight = session.gear_weight || 0
  const totalWeight = riderWeight + gearWeight

  return (
    <div className="pb-20">
      
      <div className="flex items-center justify-between mb-6 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm print:hidden">
        {prevSession ? (
          <Link href={`/history/${prevSession.id}`} replace className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-green-600 transition-colors px-2 py-2">
            <ChevronLeft size={20} /> <span className="hidden xs:inline">Precedente</span>
          </Link>
        ) : (
          <span className="text-slate-300 flex items-center gap-1 px-2 py-2 text-sm cursor-not-allowed"><ChevronLeft size={20}/> Inizio</span>
        )}

        <div className="text-xs font-mono text-slate-400">
          {new Date(session.created_at).toLocaleDateString()}
        </div>

        {nextSession ? (
          <Link href={`/history/${nextSession.id}`} replace className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-green-600 transition-colors px-2 py-2">
            <span className="hidden xs:inline">Successivo</span> <ChevronRight size={20} />
          </Link>
        ) : (
          <span className="text-slate-300 flex items-center gap-1 px-2 py-2 text-sm cursor-not-allowed">Fine <ChevronRight size={20}/></span>
        )}
      </div>

      <div className="space-y-1 mb-6">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs bg-slate-50 dark:bg-slate-900 text-slate-500 border-slate-300">
            {session.track_days?.bike?.brand} {session.track_days?.bike?.model}
          </Badge>
        </div>
        
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight">
          {session.name}
        </h1>
        
        <div className="flex flex-wrap gap-3 text-sm text-slate-500 pt-1">
          <div className="flex items-center gap-1"><MapPin size={14} className="text-green-600"/> {session.track_days?.circuit_name}</div>
          <div className="flex items-center gap-1"><Calendar size={14}/> {new Date(session.track_days?.date).toLocaleDateString()}</div>
          {(session.start_time || session.end_time) && (
            <div className="flex items-center gap-1 font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
              <Clock size={12}/> {session.start_time?.slice(0,5)} - {session.end_time?.slice(0,5)}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 print:grid-cols-2">
        <Card className="dark:bg-slate-900 dark:border-slate-800 print:shadow-none print:border">
           <CardContent className="p-4 flex items-center justify-around text-center">
              <div>
                <div className="text-[10px] uppercase text-slate-400 mb-1 flex justify-center gap-1"><User size={12}/> Pilota</div>
                <div className="font-bold">{riderWeight} kg</div>
              </div>
              <div className="text-slate-300">+</div>
              <div>
                <div className="text-[10px] uppercase text-slate-400 mb-1 flex justify-center gap-1"><Shirt size={12}/> Kit</div>
                <div className="font-bold">{gearWeight} kg</div>
              </div>
              <div className="text-slate-300">=</div>
              <div>
                <div className="text-[10px] uppercase text-green-600 font-bold mb-1">Totale</div>
                <div className="font-bold text-green-600 text-lg">{totalWeight} kg</div>
              </div>
           </CardContent>
        </Card>

        <Card className="dark:bg-slate-900 dark:border-slate-800 bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-900 print:shadow-none print:border">
           <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase text-green-700 dark:text-green-400 font-bold mb-1 flex items-center gap-1"><Timer size={12}/> Best Lap</div>
                <div className="text-2xl font-mono font-bold text-slate-900 dark:text-white">
                  {session.best_lap || "-:--.---"}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase text-slate-400 mb-1">Ideal Lap</div>
                <div className="font-mono font-bold text-slate-600 dark:text-slate-300">
                  {session.ideal_lap || "-:--.---"}
                </div>
              </div>
           </CardContent>
        </Card>
      </div>

      {/* TABS */}
      <Tabs defaultValue="perf" className="w-full print:hidden">
        <TabsList className="grid w-full grid-cols-5 h-14 mb-6">
          <TabsTrigger value="perf"><Gauge size={18}/></TabsTrigger>
          <TabsTrigger value="tires"><Disc size={18}/></TabsTrigger>
          <TabsTrigger value="fork"><ArrowDownToLine size={18}/></TabsTrigger>
          <TabsTrigger value="shock"><ArrowUpFromLine size={18}/></TabsTrigger>
          <TabsTrigger value="notes"><ClipboardList size={18}/></TabsTrigger>
        </TabsList>

        <TabsContent value="perf" className="space-y-4">
          <CardDetail title="Cronometro & Velocità">
             <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                <Row label="Passo Medio" v={session.avg_lap} />
                <Row label="Top Speed" v={session.top_speed} unit="km/h" />
             </div>
             <Separator className="my-4"/>
             <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded">
                  <div className="text-[10px] text-slate-500 uppercase">Split 1</div>
                  <div className="font-mono font-bold">{session.split_1 || "-"}</div>
                </div>
                <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded">
                  <div className="text-[10px] text-slate-500 uppercase">Split 2</div>
                  <div className="font-mono font-bold">{session.split_2 || "-"}</div>
                </div>
                <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded">
                  <div className="text-[10px] text-slate-500 uppercase">Split 3</div>
                  <div className="font-mono font-bold">{session.split_3 || "-"}</div>
                </div>
             </div>
          </CardDetail>
        </TabsContent>

        <TabsContent value="tires">
          <CardDetail title="Pneumatici">
             <Row label="Modello" v={session.tires_model} />
             <div className="grid grid-cols-2 gap-8 mt-2">
                <Row label="Press. Ant" v={session.tire_pressure_f} unit="bar" />
                <Row label="Press. Post" v={session.tire_pressure_r} unit="bar" />
             </div>
          </CardDetail>
        </TabsContent>

        <TabsContent value="fork" className="space-y-4">
           {(session.fork_sag_static || session.fork_sag_dynamic) && (
             <div className="grid grid-cols-2 gap-4">
               <SagCard label="Static Sag" value={session.fork_sag_static} icon={<Bike size={14}/>} />
               <SagCard label="Rider Sag" value={session.fork_sag_dynamic} icon={<User size={14}/>} />
             </div>
           )}
           <CardDetail title="Idraulica & Meccanica">
              <Row label="Molla (K)" v={session.fork_spring} />
              <Row label="Precarico" v={session.fork_preload} unit="giri" />
              <Row label="Compressione" v={session.fork_comp} unit="clk" />
              <Row label="Estensione" v={session.fork_reb} unit="clk" />
              <Row label="Livello Olio" v={session.fork_oil_level} unit="mm" />
              <Row label="Sfilamento" v={session.fork_height} unit="mm" />
           </CardDetail>
        </TabsContent>

        <TabsContent value="shock" className="space-y-4">
           {(session.shock_sag_static || session.shock_sag_dynamic) && (
             <div className="grid grid-cols-2 gap-4">
               <SagCard label="Static Sag" value={session.shock_sag_static} icon={<Bike size={14}/>} />
               <SagCard label="Rider Sag" value={session.shock_sag_dynamic} icon={<User size={14}/>} />
             </div>
           )}
           <CardDetail title="Idraulica & Meccanica">
              <Row label="Molla (K)" v={session.shock_spring} />
              <Row label="Precarico" v={session.shock_preload} unit="mm" />
              <Row label="Compressione" v={session.shock_comp} unit="clk" />
              <Row label="Estensione" v={session.shock_reb} unit="clk" />
              <Row label="Interasse" v={session.shock_length} unit="mm" />
           </CardDetail>
        </TabsContent>

        <TabsContent value="notes">
          <CardDetail title="Geometria">
            <Row label="Interasse" v={session.wheelbase} unit="mm" />
            <Row label="Inclinazione (Rake)" v={session.rake} unit="°" />
            <Row label="Avancorsa (Trail)" v={session.trail} unit="mm" />
          </CardDetail>

          <Card className="mt-4 dark:bg-slate-900 dark:border-slate-800">
            <CardHeader><CardTitle className="text-sm uppercase text-slate-500">Note & Feedback</CardTitle></CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {session.notes || "Nessuna nota inserita per questa sessione."}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="hidden print:block space-y-6">
         <div className="grid grid-cols-2 gap-8">
            <div className="border p-4 rounded-lg">
               <h3 className="font-bold border-b mb-2 pb-1">Forcella</h3>
               <Row label="Molla" v={session.fork_spring} />
               <Row label="Precarico" v={session.fork_preload} />
               <Row label="Comp" v={session.fork_comp} />
               <Row label="Reb" v={session.fork_reb} />
               <Row label="Olio" v={session.fork_oil_level} />
               <Row label="Sfilamento" v={session.fork_height} />
               <div className="mt-2 pt-2 border-t">
                 <Row label="Static Sag" v={session.fork_sag_static} />
                 <Row label="Rider Sag" v={session.fork_sag_dynamic} />
               </div>
            </div>
            <div className="border p-4 rounded-lg">
               <h3 className="font-bold border-b mb-2 pb-1">Mono</h3>
               <Row label="Molla" v={session.shock_spring} />
               <Row label="Precarico" v={session.shock_preload} />
               <Row label="Comp" v={session.shock_comp} />
               <Row label="Reb" v={session.shock_reb} />
               <Row label="Interasse" v={session.shock_length} />
               <div className="mt-2 pt-2 border-t">
                 <Row label="Static Sag" v={session.shock_sag_static} />
                 <Row label="Rider Sag" v={session.shock_sag_dynamic} />
               </div>
            </div>
         </div>
         
         <div className="border p-4 rounded-lg">
            <h3 className="font-bold border-b mb-2 pb-1">Gomme & Geo</h3>
            <div className="grid grid-cols-2 gap-8">
               <div>
                  <Row label="Modello" v={session.tires_model} />
                  <Row label="Press. Ant" v={session.tire_pressure_f} />
                  <Row label="Press. Post" v={session.tire_pressure_r} />
               </div>
               <div>
                  <Row label="Interasse" v={session.wheelbase} />
                  <Row label="Rake" v={session.rake} />
                  <Row label="Trail" v={session.trail} />
               </div>
            </div>
         </div>

         <div className="border p-4 rounded-lg">
            <h3 className="font-bold border-b mb-2 pb-1">Note</h3>
            <p className="text-sm whitespace-pre-wrap">{session.notes}</p>
         </div>
         
         <div className="text-center text-xs text-slate-400 mt-10">
            Generato da SagManager - {new Date().toLocaleDateString()}
         </div>
      </div>

    </div>
  )
}

export default async function SessionDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

  return (
    <PageLayout 
      title="Dettaglio Turno" 
      showBackButton 
      rightAction={<PrintButton />}
    >
      <Suspense fallback={<div className="p-10 text-center">Caricamento...</div>}>
        <SessionDetail id={params.id} />
      </Suspense>
    </PageLayout>
  )
}