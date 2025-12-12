// src/app/new-session/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
// IMPORTA IL TUO CLIENT SUPABASE ESISTENTE
// Controlla che il percorso sia giusto per il tuo progetto (es: @/utils/supabase/client)
import { createClient } from "@/lib/supabase/client" 

import { PageLayout } from "@/components/layout/page-layout"
import { Stepper } from "@/components/ui/stepper"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Save, ClipboardList, Disc, ArrowDownToLine, ArrowUpFromLine, Ruler, Loader2 
} from "lucide-react"

// --- TYPES (Struttura Dati) ---
type SetupData = {
  sessionName: string;
  bikeModel: string;
  riderWeight: number;
  circuit: string;
  tiresModel: string;
  tirePressF: number;
  tirePressR: number;
  forkModel: string;
  forkSpring: number;
  forkPreload: number;
  forkComp: number;
  forkReb: number;
  forkOilLevel: number;
  forkHeight: number;
  forkSagStatic: number;
  forkSagDynamic: number;
  shockModel: string;
  shockSpring: number;
  shockPreload: number;
  shockComp: number;
  shockReb: number;
  shockLength: number;
  shockSagStatic: number;
  shockSagDynamic: number;
  wheelbase: number;
  rake: number;
  trail: number;
}

const DEFAULT_DATA: SetupData = {
  sessionName: "Nuova Sessione",
  bikeModel: "Caricamento...",
  riderWeight: 75,
  circuit: "Vallelunga",
  tiresModel: "Pirelli SC1",
  tirePressF: 2.1,
  tirePressR: 1.6,
  forkModel: "Standard",
  forkSpring: 10.0,
  forkPreload: 5,
  forkComp: 10,
  forkReb: 10,
  forkOilLevel: 140,
  forkHeight: 2,
  forkSagStatic: 25,
  forkSagDynamic: 35,
  shockModel: "Standard",
  shockSpring: 95,
  shockPreload: 10,
  shockComp: 10,
  shockReb: 10,
  shockLength: 315,
  shockSagStatic: 10,
  shockSagDynamic: 30,
  wheelbase: 1400,
  rake: 24.0,
  trail: 100
}

export default function NewSessionPage() {
  const router = useRouter()
  // Inizializziamo il client Supabase usando la tua funzione
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [bikeId, setBikeId] = useState<string | null>(null)
  
  // Dati attuali e precedenti
  const [formData, setFormData] = useState<SetupData>(DEFAULT_DATA)
  const [previousSession, setPreviousSession] = useState<SetupData | undefined>(undefined)

  // --- 1. CARICAMENTO DATI ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // A. Verifica Utente
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
           console.log("Utente non loggato - reindirizzo...")
           // Opzionale: router.push('/login')
           // Per ora continuiamo per test (ma i dati non verranno salvati senza user)
        }

        const userId = user?.id

        // B. Trova Moto (Logica semplificata: prende la prima moto o ne crea una)
        if (userId) {
          let { data: bike } = await supabase
            .from('bikes')
            .select('*')
            .eq('user_id', userId)
            .limit(1)
            .maybeSingle()

          // Se l'utente non ha moto, ne creiamo una al volo
          if (!bike) {
             const { data: newBike } = await supabase.from('bikes').insert({
               user_id: userId, name: 'La mia Yamaha', brand: 'Yamaha', model: 'R1', year: 2019
             }).select().single()
             bike = newBike
          }

          if (bike) {
            setBikeId(bike.id)
            
            // C. Trova l'ULTIMA sessione per ereditare i dati
            const { data: lastSessionData } = await supabase
              .from('sessions')
              .select(`
                *,
                track_days!inner ( bike_id, circuit_name )
              `)
              .eq('track_days.bike_id', bike.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle()

            if (lastSessionData) {
              const mappedData: SetupData = {
                sessionName: "Nuova Sessione",
                bikeModel: `${bike.brand} ${bike.model}`,
                riderWeight: 75,
                circuit: lastSessionData.track_days.circuit_name,
                tiresModel: lastSessionData.tires_model,
                tirePressF: lastSessionData.tire_pressure_f,
                tirePressR: lastSessionData.tire_pressure_r,
                forkModel: lastSessionData.fork_model || "",
                forkSpring: lastSessionData.fork_spring,
                forkPreload: lastSessionData.fork_preload,
                forkComp: lastSessionData.fork_comp,
                forkReb: lastSessionData.fork_reb,
                forkOilLevel: lastSessionData.fork_oil_level,
                forkHeight: lastSessionData.fork_height,
                forkSagStatic: lastSessionData.fork_sag_static,
                forkSagDynamic: lastSessionData.fork_sag_dynamic,
                shockModel: lastSessionData.shock_model || "",
                shockSpring: lastSessionData.shock_spring,
                shockPreload: lastSessionData.shock_preload,
                shockComp: lastSessionData.shock_comp,
                shockReb: lastSessionData.shock_reb,
                shockLength: lastSessionData.shock_length,
                shockSagStatic: lastSessionData.shock_sag_static,
                shockSagDynamic: lastSessionData.shock_sag_dynamic,
                wheelbase: lastSessionData.wheelbase,
                rake: lastSessionData.rake,
                trail: lastSessionData.trail
              }
              setPreviousSession(mappedData)
              setFormData(mappedData)
            } else {
               // Nessuna sessione precedente: imposta solo il nome moto
               setFormData(prev => ({...prev, bikeModel: `${bike.brand} ${bike.model}`}))
            }
          }
        }
      } catch (error) {
        console.error("Errore init:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, []) // Empty dependency array = esegui solo al mount

  const updateField = (field: keyof SetupData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // --- 2. SALVATAGGIO ---
  const handleSave = async () => {
    if (!bikeId) {
      alert("Nessuna moto trovata. Assicurati di aver effettuato l'accesso.")
      return
    }
    setSaving(true)

    try {
      // A. Gestione Track Day (Cerca o Crea Giornata per Oggi)
      const today = new Date().toISOString().split('T')[0]
      
      let { data: trackDay } = await supabase
        .from('track_days')
        .select('id')
        .eq('bike_id', bikeId)
        .eq('date', today)
        .eq('circuit_name', formData.circuit)
        .maybeSingle()

      if (!trackDay) {
        const { data: newTrackDay, error: tdError } = await supabase
          .from('track_days')
          .insert({
            bike_id: bikeId,
            date: today,
            circuit_name: formData.circuit,
            rider_weight: formData.riderWeight
          })
          .select()
          .single()
        
        if (tdError) throw tdError
        trackDay = newTrackDay
      }

      // B. Inserimento Sessione
      const sessionPayload = {
        track_day_id: trackDay.id,
        name: formData.sessionName,
        session_number: 1, // TODO: Calcolare progressivo
        
        tires_model: formData.tiresModel,
        tire_pressure_f: formData.tirePressF,
        tire_pressure_r: formData.tirePressR,

        fork_model: formData.forkModel,
        fork_spring: formData.forkSpring,
        fork_preload: formData.forkPreload,
        fork_comp: formData.forkComp,
        fork_reb: formData.forkReb,
        fork_oil_level: formData.forkOilLevel,
        fork_height: formData.forkHeight,
        fork_sag_static: formData.forkSagStatic,
        fork_sag_dynamic: formData.forkSagDynamic,

        shock_model: formData.shockModel,
        shock_spring: formData.shockSpring,
        shock_preload: formData.shockPreload,
        shock_comp: formData.shockComp,
        shock_reb: formData.shockReb,
        shock_length: formData.shockLength,
        shock_sag_static: formData.shockSagStatic,
        shock_sag_dynamic: formData.shockSagDynamic,

        wheelbase: formData.wheelbase,
        rake: formData.rake,
        trail: formData.trail
      }

      const { error } = await supabase.from('sessions').insert(sessionPayload)
      if (error) throw error

      console.log("Salvataggio completato!")
      router.push('/') // Torna alla home
      
    } catch (error) {
      console.error("Errore salvataggio:", error)
      alert("Errore durante il salvataggio")
    } finally {
      setSaving(false)
    }
  }

  const saveButton = (
    <Button 
      size="sm" 
      onClick={handleSave} 
      disabled={saving || loading}
      className="bg-green-600 hover:bg-green-700 text-white gap-2 shadow-sm transition-colors"
    >
      {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
      <span className="hidden sm:inline">{saving ? "Salvataggio..." : "Salva"}</span>
    </Button>
  )

  // Loading Screen
  if (loading) {
    return (
      <PageLayout title="Nuova Sessione">
        <div className="flex flex-col items-center justify-center h-[50vh] text-slate-400">
          <Loader2 size={40} className="animate-spin mb-4 text-green-500" />
          <p>Sincronizzazione Garage...</p>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Nuova Sessione" action={saveButton}>
      
      {/* 1. INFO */}
      <Card className="mb-4 dark:bg-slate-900 dark:border-slate-800">
        <CardContent className="pt-6">
          <Label className="text-slate-500 dark:text-slate-400">Nome Sessione</Label>
          <Input 
            value={formData.sessionName} 
            onChange={(e) => updateField('sessionName', e.target.value)}
            className="font-bold text-lg mt-1 dark:bg-slate-950 dark:border-slate-700 focus-visible:ring-green-500"
          />
        </CardContent>
      </Card>

      {/* 2. TABS */}
      <Tabs defaultValue="fork" className="w-full">
        
        <TabsList className="grid w-full grid-cols-5 h-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl shadow-sm mb-6">
           <TabsTrigger value="general" className="flex flex-col items-center justify-center gap-1 h-full data-[state=active]:bg-slate-900 dark:data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-lg transition-all">
             <ClipboardList size={20} strokeWidth={2} />
             <span className="text-[10px] font-medium">Gen</span>
           </TabsTrigger>
           <TabsTrigger value="tires" className="flex flex-col items-center justify-center gap-1 h-full data-[state=active]:bg-slate-900 dark:data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-lg transition-all">
             <Disc size={20} strokeWidth={2} />
             <span className="text-[10px] font-medium">Gomme</span>
           </TabsTrigger>
           <TabsTrigger value="fork" className="flex flex-col items-center justify-center gap-1 h-full data-[state=active]:bg-slate-900 dark:data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-lg transition-all">
             <ArrowDownToLine size={20} strokeWidth={2} />
             <span className="text-[10px] font-medium">Force</span>
           </TabsTrigger>
           <TabsTrigger value="shock" className="flex flex-col items-center justify-center gap-1 h-full data-[state=active]:bg-slate-900 dark:data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-lg transition-all">
             <ArrowUpFromLine size={20} strokeWidth={2} />
             <span className="text-[10px] font-medium">Mono</span>
           </TabsTrigger>
           <TabsTrigger value="geo" className="flex flex-col items-center justify-center gap-1 h-full data-[state=active]:bg-slate-900 dark:data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-lg transition-all">
             <Ruler size={20} strokeWidth={2} />
             <span className="text-[10px] font-medium">Geo</span>
           </TabsTrigger>
        </TabsList>

        {/* CONTENUTO TABS (Incolla i TabContent delle risposte precedenti, la logica è identica) */}
        {/* ... TAB GENERAL ... */}
        <TabsContent value="general" className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <Card className="dark:bg-slate-900 dark:border-slate-800">
            <CardHeader><CardTitle className="text-lg dark:text-slate-100">Dati Generali</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <Label className="text-slate-500">Modello Moto</Label>
                   <Input value={formData.bikeModel} disabled className="bg-slate-100 dark:bg-slate-800 dark:border-slate-700 mt-1" />
                </div>
                <div>
                   <Label className="text-slate-500">Circuito</Label>
                   <Input 
                      value={formData.circuit} 
                      onChange={(e) => updateField('circuit', e.target.value)}
                      className="mt-1 dark:bg-slate-950 dark:border-slate-700" 
                    />
                </div>
              </div>
              <Stepper 
                 label="Peso Pilota" 
                 value={formData.riderWeight} 
                 previousValue={previousSession?.riderWeight} 
                 unit="kg" 
                 onChange={(v) => updateField('riderWeight', v)} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ... TAB TIRES ... */}
        <TabsContent value="tires" className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
           <Card className="dark:bg-slate-900 dark:border-slate-800">
            <CardHeader><CardTitle className="text-lg dark:text-slate-100">Pneumatici</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-slate-500">Marca/Modello</Label>
                <Input value={formData.tiresModel} onChange={(e) => updateField('tiresModel', e.target.value)} className="mt-1 dark:bg-slate-950 dark:border-slate-700" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Stepper label="Press. Anteriore" value={formData.tirePressF} previousValue={previousSession?.tirePressF} step={0.1} unit="bar" onChange={(v) => updateField('tirePressF', v)} />
                <Stepper label="Press. Posteriore" value={formData.tirePressR} previousValue={previousSession?.tirePressR} step={0.1} unit="bar" onChange={(v) => updateField('tirePressR', v)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ... TAB FORK ... */}
        <TabsContent value="fork" className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <Card className="dark:bg-slate-900 dark:border-slate-800">
            <CardHeader><CardTitle className="text-lg dark:text-slate-100">Forcella (Anteriore)</CardTitle></CardHeader>
            <CardContent className="space-y-1">
              <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border dark:border-slate-800">
                <h3 className="font-semibold text-slate-500 mb-4 text-xs uppercase tracking-wider">Idraulica</h3>
                <Stepper label="Compressione" value={formData.forkComp} previousValue={previousSession?.forkComp} unit="click" onChange={(v) => updateField('forkComp', v)} />
                <Stepper label="Rebound (Estensione)" value={formData.forkReb} previousValue={previousSession?.forkReb} unit="click" onChange={(v) => updateField('forkReb', v)} />
              </div>
              <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border dark:border-slate-800">
                <h3 className="font-semibold text-slate-500 mb-4 text-xs uppercase tracking-wider">Meccanica</h3>
                <Stepper label="Precarico Molla" value={formData.forkPreload} previousValue={previousSession?.forkPreload} unit="giri" onChange={(v) => updateField('forkPreload', v)} />
                <Stepper label="Molla (K)" value={formData.forkSpring} previousValue={previousSession?.forkSpring} step={0.5} unit="N/mm" onChange={(v) => updateField('forkSpring', v)} />
                <Stepper label="Livello Olio" value={formData.forkOilLevel} previousValue={previousSession?.forkOilLevel} step={5} unit="mm" onChange={(v) => updateField('forkOilLevel', v)} />
                <Stepper label="Altezza (Sfilamento)" value={formData.forkHeight} previousValue={previousSession?.forkHeight} unit="tacche" onChange={(v) => updateField('forkHeight', v)} />
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border dark:border-slate-800">
                <h3 className="font-semibold text-slate-500 mb-4 text-xs uppercase tracking-wider">Misurazioni Sag</h3>
                <Stepper label="Sag Statico" value={formData.forkSagStatic} previousValue={previousSession?.forkSagStatic} unit="mm" onChange={(v) => updateField('forkSagStatic', v)} />
                <Stepper label="Sag Dinamico" value={formData.forkSagDynamic} previousValue={previousSession?.forkSagDynamic} unit="mm" onChange={(v) => updateField('forkSagDynamic', v)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ... TAB SHOCK ... */}
        <TabsContent value="shock" className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <Card className="dark:bg-slate-900 dark:border-slate-800">
            <CardHeader><CardTitle className="text-lg dark:text-slate-100">Mono (Posteriore)</CardTitle></CardHeader>
            <CardContent className="space-y-1">
               <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border dark:border-slate-800">
                <h3 className="font-semibold text-slate-500 mb-4 text-xs uppercase tracking-wider">Idraulica</h3>
                <Stepper label="Compressione" value={formData.shockComp} previousValue={previousSession?.shockComp} unit="click" onChange={(v) => updateField('shockComp', v)} />
                <Stepper label="Rebound (Estensione)" value={formData.shockReb} previousValue={previousSession?.shockReb} unit="click" onChange={(v) => updateField('shockReb', v)} />
              </div>
              <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border dark:border-slate-800">
                <h3 className="font-semibold text-slate-500 mb-4 text-xs uppercase tracking-wider">Meccanica</h3>
                <Stepper label="Precarico Molla" value={formData.shockPreload} previousValue={previousSession?.shockPreload} unit="mm" onChange={(v) => updateField('shockPreload', v)} />
                <Stepper label="Molla (K)" value={formData.shockSpring} previousValue={previousSession?.shockSpring} step={5} unit="N/mm" onChange={(v) => updateField('shockSpring', v)} />
                <Stepper label="Interasse (Lunghezza)" value={formData.shockLength} previousValue={previousSession?.shockLength} step={0.5} unit="mm" onChange={(v) => updateField('shockLength', v)} />
              </div>
               <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border dark:border-slate-800">
                <h3 className="font-semibold text-slate-500 mb-4 text-xs uppercase tracking-wider">Misurazioni Sag</h3>
                <Stepper label="Sag Statico" value={formData.shockSagStatic} previousValue={previousSession?.shockSagStatic} unit="mm" onChange={(v) => updateField('shockSagStatic', v)} />
                <Stepper label="Sag Dinamico" value={formData.shockSagDynamic} previousValue={previousSession?.shockSagDynamic} unit="mm" onChange={(v) => updateField('shockSagDynamic', v)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ... TAB GEO ... */}
        <TabsContent value="geo" className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <Card className="dark:bg-slate-900 dark:border-slate-800">
            <CardHeader><CardTitle className="text-lg dark:text-slate-100">Geometria Telaio</CardTitle></CardHeader>
            <CardContent>
              <Stepper label="Interasse Totale" value={formData.wheelbase} previousValue={previousSession?.wheelbase} step={1} unit="mm" onChange={(v) => updateField('wheelbase', v)} />
              <Stepper label="Inclinazione Cannotto" value={formData.rake} previousValue={previousSession?.rake} step={0.1} unit="deg" onChange={(v) => updateField('rake', v)} />
              <Stepper label="Avancorsa (Trail)" value={formData.trail} previousValue={previousSession?.trail} step={1} unit="mm" onChange={(v) => updateField('trail', v)} />
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </PageLayout>
  )
}