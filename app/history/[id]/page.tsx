"use client"

import { useEffect, useState, use, Suspense } from "react"
import { createClient } from "@/lib/supabase/client"
import { addSessionToPDF } from "@/lib/pdf-utils"
import { PageLayout } from "@/components/layout/page-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { 
  Loader2, Trash2, Printer, Calendar, MapPin, Bike,
  ClipboardList, Disc, ArrowDownToLine, ArrowUpFromLine, Ruler 
} from "lucide-react"
import jsPDF from "jspdf"

function ValueBox({ label, value, unit }: { label: string, value: any, unit?: string }) {
  return (
    <div className="flex flex-col gap-1 p-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-lg">
      <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider truncate">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
          {value !== null && value !== undefined ? value : "-"}
        </span>
        {unit && <span className="text-xs text-slate-500 font-medium">{unit}</span>}
      </div>
    </div>
  )
}

// 1. Componente Interno con la logica (Sospeso)
function SessionContent({ id }: { id: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSession = async () => {
      const { data, error } = await supabase
        .from('sessions')
        .select(`*, track_days ( date, circuit_name, rider_weight, bike:bikes(brand, model) )`)
        .eq('id', id)
        .single()

      if (error) {
        toast.error("Errore caricamento")
        router.push('/history')
      } else {
        setSession(data)
      }
      setLoading(false)
    }
    fetchSession()
  }, [id, router])

  const handleExportPDF = () => {
    if (!session) return;
    const doc = new jsPDF();
    
    addSessionToPDF(doc, session);
    
    const dateObj = new Date(session.created_at);
    const dateStr = dateObj.toISOString().split('T')[0]; 
    const timeStr = dateObj.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }).replace(':', '');
    const safeName = session.name.replace(/\s+/g, '_');

    const fileName = `SagManager-${dateStr}-${timeStr}-${safeName}.pdf`;
    
    doc.save(fileName);
    toast.success("PDF scaricato", { description: fileName });
  }

  const handleDelete = async () => {
    if (!confirm("Eliminare questa sessione?")) return
    const { error } = await supabase.from('sessions').delete().eq('id', id)
    if (!error) {
      toast.success("Eliminata")
      router.push('/history')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center pt-20">
        <Loader2 className="animate-spin text-green-600" />
      </div>
    )
  }

  if (!session) return null

  const headerActions = (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" onClick={handleExportPDF} className="text-slate-600 hover:text-green-600 dark:text-slate-300">
        <Printer size={20} />
      </Button>
      <Button variant="ghost" size="icon" onClick={handleDelete} className="text-slate-600 hover:text-red-600 dark:text-slate-300">
        <Trash2 size={20} />
      </Button>
    </div>
  )

  return (
    <PageLayout title={session.name} action={headerActions}>
      <div className="space-y-6 pb-10">

        {/* Header Info */}
        <Card className="dark:bg-slate-900 dark:border-slate-800 border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <Calendar size={14} />
                <span>{new Date(session.created_at).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-lg">
                <MapPin size={18} className="text-green-600" />
                {session.track_days?.circuit_name}
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm">
                <Bike size={14} />
                {session.track_days?.bike?.brand} {session.track_days?.bike?.model}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 1. Generale & Gomme */}
        <Card className="dark:bg-slate-900 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg dark:text-white flex items-center gap-2">
              <Disc className="text-green-600" size={20} /> Generale & Gomme
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ValueBox label="Modello Gomme" value={session.tires_model} />
            <div className="grid grid-cols-3 gap-3">
              <ValueBox label="Peso Pilota" value={session.track_days?.rider_weight} unit="kg" />
              <ValueBox label="Press. Ant" value={session.tire_pressure_f} unit="bar" />
              <ValueBox label="Press. Post" value={session.tire_pressure_r} unit="bar" />
            </div>
          </CardContent>
        </Card>

        {/* 2. Forcella */}
        <Card className="dark:bg-slate-900 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg dark:text-white flex items-center gap-2">
              <ArrowDownToLine className="text-green-600" size={20} /> Forcella
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
                <ValueBox label="Compressione" value={session.fork_comp} unit="click" />
                <ValueBox label="Rebound" value={session.fork_reb} unit="click" />
                <ValueBox label="Precarico" value={session.fork_preload} unit="giri" />
                <ValueBox label="Molla (K)" value={session.fork_spring} unit="N/mm" />
                <ValueBox label="Olio" value={session.fork_oil_level} unit="mm" />
                <ValueBox label="Sfilamento" value={session.fork_height} unit="tacche" />
            </div>
            <Separator className="dark:bg-slate-800" />
            <div className="grid grid-cols-2 gap-3">
                <ValueBox label="Sag Statico" value={session.fork_sag_static} unit="mm" />
                <ValueBox label="Sag Dinamico" value={session.fork_sag_dynamic} unit="mm" />
            </div>
          </CardContent>
        </Card>

        {/* 3. Mono */}
        <Card className="dark:bg-slate-900 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg dark:text-white flex items-center gap-2">
              <ArrowUpFromLine className="text-green-600" size={20} /> Mono
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
                <ValueBox label="Compressione" value={session.shock_comp} unit="click" />
                <ValueBox label="Rebound" value={session.shock_reb} unit="click" />
                <ValueBox label="Precarico" value={session.shock_preload} unit="mm" />
                <ValueBox label="Molla (K)" value={session.shock_spring} unit="N/mm" />
                <ValueBox label="Interasse" value={session.shock_length} unit="mm" />
            </div>
            <Separator className="dark:bg-slate-800" />
            <div className="grid grid-cols-2 gap-3">
                <ValueBox label="Sag Statico" value={session.shock_sag_static} unit="mm" />
                <ValueBox label="Sag Dinamico" value={session.shock_sag_dynamic} unit="mm" />
            </div>
          </CardContent>
        </Card>

        {/* 4. Geometria */}
        <Card className="dark:bg-slate-900 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg dark:text-white flex items-center gap-2">
              <Ruler className="text-green-600" size={20} /> Geometria
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-3">
            <ValueBox label="Interasse" value={session.wheelbase} unit="mm" />
            <ValueBox label="Inclinazione" value={session.rake} unit="deg" />
            <ValueBox label="Avancorsa" value={session.trail} unit="mm" />
          </CardContent>
        </Card>

      </div>
    </PageLayout>
  )
}

// 2. Componente Wrapper che gestisce il Parametro Asincrono
function SessionWrapper({ params }: { params: Promise<{ id: string }> }) {
  // Qui possiamo usare "use" in sicurezza perché siamo sotto Suspense
  const { id } = use(params)
  return <SessionContent id={id} />
}

// 3. Export Default (Punto di ingresso) con Suspense Boundary
export default function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={
      <PageLayout title="Caricamento...">
        <div className="flex justify-center pt-20"><Loader2 className="animate-spin text-slate-400" /></div>
      </PageLayout>
    }>
      <SessionWrapper params={params} />
    </Suspense>
  )
}