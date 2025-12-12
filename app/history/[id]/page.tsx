"use client"

import { useEffect, useState, use } from "react"
import { createClient } from "@/lib/supabase/client"
import { PageLayout } from "@/components/layout/page-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { 
  Loader2, Trash2, Printer, Calendar, MapPin, Bike 
} from "lucide-react"

// Import per PDF
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

// Componente per visualizzare il singolo dato
function ValueBox({ label, value, unit }: { label: string, value: any, unit?: string }) {
  return (
    <div className="flex flex-col gap-1 p-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-lg">
      <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
          {value !== null && value !== undefined ? value : "-"}
        </span>
        {unit && <span className="text-xs text-slate-500 font-medium">{unit}</span>}
      </div>
    </div>
  )
}

export default function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  
  const supabase = createClient()
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // 1. Fetch Dati
  useEffect(() => {
    const fetchSession = async () => {
      const { data, error } = await supabase
        .from('sessions')
        .select(`*, track_days ( date, circuit_name, rider_weight, bike:bikes(brand, model) )`)
        .eq('id', id)
        .single()

      if (error) {
        toast.error("Errore caricamento sessione")
        router.push('/history')
      } else {
        setSession(data)
      }
      setLoading(false)
    }
    fetchSession()
  }, [id, router])

  // 2. Funzione Generazione PDF
  const handleExportPDF = () => {
    if (!session) return;

    const doc = new jsPDF();

    // Intestazione PDF
    doc.setFontSize(18);
    doc.text("Scheda Setup - SagManager", 14, 20);
    
    doc.setFontSize(12);
    doc.text(`Sessione: ${session.name}`, 14, 30);
    doc.text(`Circuito: ${session.track_days?.circuit_name}`, 14, 36);
    doc.text(`Moto: ${session.track_days?.bike?.brand} ${session.track_days?.bike?.model}`, 14, 42);
    doc.text(`Data: ${new Date(session.created_at).toLocaleDateString('it-IT')}`, 14, 48);

    // Tabella Dati
    autoTable(doc, {
      startY: 55,
      head: [['Sezione', 'Parametro', 'Valore', 'Unità']],
      body: [
        // Generale & Gomme
        ['Generale', 'Peso Pilota', session.track_days?.rider_weight, 'kg'],
        ['Gomme', 'Modello', session.tires_model, ''],
        ['Gomme', 'Press. Anteriore', session.tire_pressure_f, 'bar'],
        ['Gomme', 'Press. Posteriore', session.tire_pressure_r, 'bar'],
        
        // Forcella
        ['Forcella', 'Molla (K)', session.fork_spring, 'N/mm'],
        ['Forcella', 'Precarico', session.fork_preload, 'giri'],
        ['Forcella', 'Compressione', session.fork_comp, 'click'],
        ['Forcella', 'Rebound', session.fork_reb, 'click'],
        ['Forcella', 'Livello Olio', session.fork_oil_level, 'mm'],
        ['Forcella', 'Sfilamento', session.fork_height, 'tacche'],
        ['Forcella', 'Sag Statico', session.fork_sag_static, 'mm'],
        ['Forcella', 'Sag Dinamico', session.fork_sag_dynamic, 'mm'],

        // Mono
        ['Mono', 'Molla (K)', session.shock_spring, 'N/mm'],
        ['Mono', 'Precarico', session.shock_preload, 'mm'],
        ['Mono', 'Compressione', session.shock_comp, 'click'],
        ['Mono', 'Rebound', session.shock_reb, 'click'],
        ['Mono', 'Interasse', session.shock_length, 'mm'],
        ['Mono', 'Sag Statico', session.shock_sag_static, 'mm'],
        ['Mono', 'Sag Dinamico', session.shock_sag_dynamic, 'mm'],

        // Geometria
        ['Geometria', 'Interasse', session.wheelbase, 'mm'],
        ['Geometria', 'Inclinazione', session.rake, 'deg'],
        ['Geometria', 'Avancorsa', session.trail, 'mm'],
      ],
      theme: 'grid',
      headStyles: { fillColor: [22, 163, 74] } // Verde SagManager
    });

    doc.save(`setup_${session.name.replace(/\s+/g, '_')}.pdf`);
    toast.success("PDF scaricato con successo");
  }

  // 3. Funzione Eliminazione
  const handleDelete = async () => {
    if (!confirm("Sei sicuro di voler eliminare questa sessione?")) return

    const { error } = await supabase.from('sessions').delete().eq('id', id)
    if (error) {
      toast.error("Errore durante l'eliminazione")
    } else {
      toast.success("Sessione eliminata")
      router.push('/history')
    }
  }

  if (loading) {
    return (
      <PageLayout title="Dettaglio">
        <div className="flex justify-center pt-20"><Loader2 className="animate-spin text-green-600" /></div>
      </PageLayout>
    )
  }

  if (!session) return null

  // Header Actions: Gruppo bottoni (PDF + Trash)
  const headerActions = (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" onClick={handleExportPDF} className="text-slate-600 hover:text-green-600 dark:text-slate-300 dark:hover:text-green-400">
        <Printer size={20} />
      </Button>
      <Button variant="ghost" size="icon" onClick={handleDelete} className="text-slate-600 hover:text-red-600 dark:text-slate-300 dark:hover:text-red-400">
        <Trash2 size={20} />
      </Button>
    </div>
  )

  return (
    <PageLayout title={session.name} action={headerActions}>
      
      {/* Container a scorrimento verticale unico */}
      <div className="space-y-6 pb-10">

        {/* 1. Header Info Card */}
        <Card className="dark:bg-slate-900 dark:border-slate-800 border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                  <Calendar size={14} />
                  <span>{new Date(session.created_at).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
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
            </div>
          </CardContent>
        </Card>

        {/* 2. Generale & Gomme */}
        <Card className="dark:bg-slate-900 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg dark:text-white flex items-center gap-2">
              Generale & Gomme
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

        {/* 3. Forcella */}
        <Card className="dark:bg-slate-900 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg dark:text-white">Forcella (Anteriore)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-sm mb-3 text-slate-500 uppercase tracking-wider">Idraulica</h4>
              <div className="grid grid-cols-2 gap-3">
                <ValueBox label="Compressione" value={session.fork_comp} unit="click" />
                <ValueBox label="Rebound" value={session.fork_reb} unit="click" />
              </div>
            </div>
            <Separator className="dark:bg-slate-800" />
            <div>
              <h4 className="font-semibold text-sm mb-3 text-slate-500 uppercase tracking-wider">Meccanica</h4>
              <div className="grid grid-cols-2 gap-3">
                <ValueBox label="Precarico" value={session.fork_preload} unit="giri" />
                <ValueBox label="Molla (K)" value={session.fork_spring} unit="N/mm" />
                <ValueBox label="Livello Olio" value={session.fork_oil_level} unit="mm" />
                <ValueBox label="Sfilamento" value={session.fork_height} unit="tacche" />
              </div>
            </div>
            <Separator className="dark:bg-slate-800" />
            <div className="grid grid-cols-2 gap-3">
                <ValueBox label="Sag Statico" value={session.fork_sag_static} unit="mm" />
                <ValueBox label="Sag Dinamico" value={session.fork_sag_dynamic} unit="mm" />
            </div>
          </CardContent>
        </Card>

        {/* 4. Mono */}
        <Card className="dark:bg-slate-900 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg dark:text-white">Mono (Posteriore)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-sm mb-3 text-slate-500 uppercase tracking-wider">Idraulica</h4>
              <div className="grid grid-cols-2 gap-3">
                <ValueBox label="Compressione" value={session.shock_comp} unit="click" />
                <ValueBox label="Rebound" value={session.shock_reb} unit="click" />
              </div>
            </div>
            <Separator className="dark:bg-slate-800" />
            <div>
              <h4 className="font-semibold text-sm mb-3 text-slate-500 uppercase tracking-wider">Meccanica</h4>
              <div className="grid grid-cols-2 gap-3">
                <ValueBox label="Precarico" value={session.shock_preload} unit="mm" />
                <ValueBox label="Molla (K)" value={session.shock_spring} unit="N/mm" />
                <ValueBox label="Interasse" value={session.shock_length} unit="mm" />
              </div>
            </div>
            <Separator className="dark:bg-slate-800" />
            <div className="grid grid-cols-2 gap-3">
                <ValueBox label="Sag Statico" value={session.shock_sag_static} unit="mm" />
                <ValueBox label="Sag Dinamico" value={session.shock_sag_dynamic} unit="mm" />
            </div>
          </CardContent>
        </Card>

        {/* 5. Geometria */}
        <Card className="dark:bg-slate-900 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg dark:text-white">Geometria</CardTitle>
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