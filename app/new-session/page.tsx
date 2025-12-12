// src/app/new-session/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client" 
import { toast } from "sonner" 

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

import { DEFAULT_CONFIG, AppConfig } from "@/lib/preferences"

// --- TYPES ---
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
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [bikeId, setBikeId] = useState<string | null>(null)
  
  // Configurazione dinamica (Min/Max/Step/Unit)
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG)
  
  // Dati attuali (modificabili)
  const [formData, setFormData] = useState<SetupData>(DEFAULT_DATA)
  // Dati sessione precedente (SOLO LETTURA per confronto "era X")
  const [previousSession, setPreviousSession] = useState<SetupData | undefined>(undefined)

  // --- 1. CARICAMENTO DATI ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        const userId = user?.id

        if (userId) {
          // A. Recupera Configurazione Utente
          const { data: prefData } = await supabase
            .from('user_preferences')
            .select('config')
            .eq('user_id', userId)
            .single()

          if (prefData?.config) {
            // Uniamo la config salvata con quella di default per sicurezza
            setConfig({ ...DEFAULT_CONFIG, ...prefData.config })
          }

          // B. Cerchiamo la moto dell'utente
          let { data: bike } = await supabase
            .from('bikes')
            .select('*')
            .eq('user_id', userId)
            .limit(1)
            .maybeSingle()

          // Se non esiste, ne creiamo una di default per non bloccare l'app
          if (!bike) {
             const { data: newBike } = await supabase.from('bikes').insert({
               user_id: userId, name: 'La mia Moto', brand: 'Yamaha', model: 'R1', year: 2019
             }).select().single()
             bike = newBike
          }

          if (bike) {
            setBikeId(bike.id)
            
            // C. Cerchiamo l'ultima sessione salvata per questa moto
            const { data: lastSessionData } = await supabase
              .from('sessions')
              .select(`*, track_days!inner ( bike_id, circuit_name )`)
              .eq('track_days.bike_id', bike.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle()

            if (lastSessionData) {
              // Mappiamo i dati dal DB allo stato locale
              const mappedData: SetupData = {
                sessionName: "Nuova Sessione", // Resettiamo il nome per la nuova
                bikeModel: `${bike.brand} ${bike.model}`,
                riderWeight: 75, // Valore default se non presente in DB
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
              
              setPreviousSession(mappedData) // Salviamo per i confronti "era X"
              setFormData(mappedData)        // Pre-popoliamo i campi
            } else {
               // Nessuna sessione precedente: usiamo default + nome moto
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
  }, [])

  const updateField = (field: keyof SetupData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // --- 2. SALVATAGGIO ---
  const handleSave = async () => {
    if (!bikeId) {
      toast.error("Nessuna moto trovata", {
        description: "Assicurati di essere loggato e di avere una moto.",
      })
      return
    }
    setSaving(true)

    try {
      const today = new Date().toISOString().split('T')[0]
      
      // A. Gestione Track Day
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
      
      if (!trackDay) {
        throw new Error("Impossibile creare o recuperare la giornata (Track Day null).");
      }

      // B. Calcolo Numero Sessione
      const { count } = await supabase
        .from('sessions')
        .select('*', { count: 'exact', head: true })
        .eq('track_day_id', trackDay.id)
      
      const nextSessionNumber = (count || 0) + 1
      const finalName = formData.sessionName === "Nuova Sessione" 
        ? `Sessione ${nextSessionNumber}` 
        : formData.sessionName

      // C. Inserimento Sessione
      const sessionPayload = {
        track_day_id: trackDay.id,
        name: finalName,
        session_number: nextSessionNumber,
        
        // Mappatura campi Form -> DB
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
        trail: formData.trail,
        
        notes: "Setup salvato da SagManager"
      }

      const { error } = await supabase.from('sessions').insert(sessionPayload)
      if (error) throw error

      toast.success("Setup Salvato! 🏁", {
        description: `${finalName} registrata con successo.`,
      })

      // Redirect
      setTimeout(() => {
        router.push('/')
        router.refresh()
      }, 1000)
      
    } catch (error) {
      console.error("Errore salvataggio:", error)
      toast.error("Errore di salvataggio", {
        description: "Controlla la console o riprova.",
      })
    } finally {
      setSaving(false)
    }
  }

  // Pulsante Header
  const saveButton = (
    <Button 
      size="sm" 
      onClick={handleSave} 
      disabled={saving || loading}
      className="bg-green-600 hover:bg-green-700 text-white gap-2 transition-colors h-9 px-3"
    >
      {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
      <span className={saving ? "hidden" : "hidden xs:inline"}>
        {saving ? "" : "Salva"}
      </span>
    </Button>
  )

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
    <PageLayout 
      title="Nuova Sessione" 
      rightAction={saveButton} 
      showBackButton={true}
    >
      
      {/* 1. INFO HEADER */}
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

      {/* 2. TAB DI NAVIGAZIONE */}
      <Tabs defaultValue="fork" className="w-full">
        
        <TabsList className="grid w-full grid-cols-5 h-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl shadow-sm mb-6">
           <TabsTrigger value="general" className="flex flex-col items-center justify-center gap-1 h-full data-[state=active]:bg-slate-900 dark:data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-lg transition-all">
             <ClipboardList size={20} strokeWidth={2} />
             <span className="text-[10px] font-medium tracking-tight">Generale</span>
           </TabsTrigger>
           <TabsTrigger value="tires" className="flex flex-col items-center justify-center gap-1 h-full data-[state=active]:bg-slate-900 dark:data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-lg transition-all">
             <Disc size={20} strokeWidth={2} />
             <span className="text-[10px] font-medium tracking-tight">Gomme</span>
           </TabsTrigger>
           <TabsTrigger value="fork" className="flex flex-col items-center justify-center gap-1 h-full data-[state=active]:bg-slate-900 dark:data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-lg transition-all">
             <ArrowDownToLine size={20} strokeWidth={2} />
             <span className="text-[10px] font-medium tracking-tight">Forcella</span>
           </TabsTrigger>
           <TabsTrigger value="shock" className="flex flex-col items-center justify-center gap-1 h-full data-[state=active]:bg-slate-900 dark:data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-lg transition-all">
             <ArrowUpFromLine size={20} strokeWidth={2} />
             <span className="text-[10px] font-medium tracking-tight">Mono</span>
           </TabsTrigger>
           <TabsTrigger value="geo" className="flex flex-col items-center justify-center gap-1 h-full data-[state=active]:bg-slate-900 dark:data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-lg transition-all">
             <Ruler size={20} strokeWidth={2} />
             <span className="text-[10px] font-medium tracking-tight">Geometria</span>
           </TabsTrigger>
        </TabsList>

        {/* --- TAB CONTENT: GENERALE --- */}
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

        {/* --- TAB CONTENT: GOMME --- */}
        <TabsContent value="tires" className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
           <Card className="dark:bg-slate-900 dark:border-slate-800">
            <CardHeader><CardTitle className="text-lg dark:text-slate-100">Pneumatici</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-slate-500">Marca/Modello</Label>
                <Input value={formData.tiresModel} onChange={(e) => updateField('tiresModel', e.target.value)} className="mt-1 dark:bg-slate-950 dark:border-slate-700" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Stepper 
                  label={config.tirePressF.label} 
                  value={formData.tirePressF} 
                  previousValue={previousSession?.tirePressF} 
                  min={config.tirePressF.min} max={config.tirePressF.max} step={config.tirePressF.step} unit={config.tirePressF.unit}
                  onChange={(v) => updateField('tirePressF', v)} 
                />
                <Stepper 
                  label={config.tirePressR.label} 
                  value={formData.tirePressR} 
                  previousValue={previousSession?.tirePressR} 
                  min={config.tirePressR.min} max={config.tirePressR.max} step={config.tirePressR.step} unit={config.tirePressR.unit}
                  onChange={(v) => updateField('tirePressR', v)} 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- TAB CONTENT: FORCELLA --- */}
        <TabsContent value="fork" className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <Card className="dark:bg-slate-900 dark:border-slate-800">
            <CardHeader><CardTitle className="text-lg dark:text-slate-100">Forcella (Anteriore)</CardTitle></CardHeader>
            <CardContent className="space-y-1">
              <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border dark:border-slate-800">
                <h3 className="font-semibold text-slate-500 mb-4 text-xs uppercase tracking-wider">Idraulica</h3>
                <Stepper 
                  label={config.forkComp.label} value={formData.forkComp} previousValue={previousSession?.forkComp}
                  min={config.forkComp.min} max={config.forkComp.max} step={config.forkComp.step} unit={config.forkComp.unit}
                  onChange={(v) => updateField('forkComp', v)} 
                />
                <Stepper 
                  label={config.forkReb.label} value={formData.forkReb} previousValue={previousSession?.forkReb} 
                  min={config.forkReb.min} max={config.forkReb.max} step={config.forkReb.step} unit={config.forkReb.unit}
                  onChange={(v) => updateField('forkReb', v)} 
                />
              </div>
              <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border dark:border-slate-800">
                <h3 className="font-semibold text-slate-500 mb-4 text-xs uppercase tracking-wider">Meccanica</h3>
                <Stepper 
                  label={config.forkPreload.label} value={formData.forkPreload} previousValue={previousSession?.forkPreload} 
                  min={config.forkPreload.min} max={config.forkPreload.max} step={config.forkPreload.step} unit={config.forkPreload.unit}
                  onChange={(v) => updateField('forkPreload', v)} 
                />
                <Stepper 
                  label={config.forkSpring.label} value={formData.forkSpring} previousValue={previousSession?.forkSpring} 
                  min={config.forkSpring.min} max={config.forkSpring.max} step={config.forkSpring.step} unit={config.forkSpring.unit}
                  onChange={(v) => updateField('forkSpring', v)} 
                />
                <Stepper 
                  label={config.forkOilLevel.label} value={formData.forkOilLevel} previousValue={previousSession?.forkOilLevel} 
                  min={config.forkOilLevel.min} max={config.forkOilLevel.max} step={config.forkOilLevel.step} unit={config.forkOilLevel.unit}
                  onChange={(v) => updateField('forkOilLevel', v)} 
                />
                <Stepper 
                  label={config.forkHeight.label} value={formData.forkHeight} previousValue={previousSession?.forkHeight} 
                  min={config.forkHeight.min} max={config.forkHeight.max} step={config.forkHeight.step} unit={config.forkHeight.unit}
                  onChange={(v) => updateField('forkHeight', v)} 
                />
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border dark:border-slate-800">
                <h3 className="font-semibold text-slate-500 mb-4 text-xs uppercase tracking-wider">Misurazioni Sag</h3>
                <Stepper 
                  label={config.forkSagStatic.label} value={formData.forkSagStatic} previousValue={previousSession?.forkSagStatic} 
                  min={config.forkSagStatic.min} max={config.forkSagStatic.max} step={config.forkSagStatic.step} unit={config.forkSagStatic.unit}
                  onChange={(v) => updateField('forkSagStatic', v)} 
                />
                <Stepper 
                  label={config.forkSagDynamic.label} value={formData.forkSagDynamic} previousValue={previousSession?.forkSagDynamic} 
                  min={config.forkSagDynamic.min} max={config.forkSagDynamic.max} step={config.forkSagDynamic.step} unit={config.forkSagDynamic.unit}
                  onChange={(v) => updateField('forkSagDynamic', v)} 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- TAB CONTENT: MONO --- */}
        <TabsContent value="shock" className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <Card className="dark:bg-slate-900 dark:border-slate-800">
            <CardHeader><CardTitle className="text-lg dark:text-slate-100">Mono (Posteriore)</CardTitle></CardHeader>
            <CardContent className="space-y-1">
               <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border dark:border-slate-800">
                <h3 className="font-semibold text-slate-500 mb-4 text-xs uppercase tracking-wider">Idraulica</h3>
                <Stepper 
                  label={config.shockComp.label} value={formData.shockComp} previousValue={previousSession?.shockComp} 
                  min={config.shockComp.min} max={config.shockComp.max} step={config.shockComp.step} unit={config.shockComp.unit}
                  onChange={(v) => updateField('shockComp', v)} 
                />
                <Stepper 
                  label={config.shockReb.label} value={formData.shockReb} previousValue={previousSession?.shockReb} 
                  min={config.shockReb.min} max={config.shockReb.max} step={config.shockReb.step} unit={config.shockReb.unit}
                  onChange={(v) => updateField('shockReb', v)} 
                />
              </div>
              <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border dark:border-slate-800">
                <h3 className="font-semibold text-slate-500 mb-4 text-xs uppercase tracking-wider">Meccanica</h3>
                <Stepper 
                  label={config.shockPreload.label} value={formData.shockPreload} previousValue={previousSession?.shockPreload} 
                  min={config.shockPreload.min} max={config.shockPreload.max} step={config.shockPreload.step} unit={config.shockPreload.unit}
                  onChange={(v) => updateField('shockPreload', v)} 
                />
                <Stepper 
                  label={config.shockSpring.label} value={formData.shockSpring} previousValue={previousSession?.shockSpring} 
                  min={config.shockSpring.min} max={config.shockSpring.max} step={config.shockSpring.step} unit={config.shockSpring.unit}
                  onChange={(v) => updateField('shockSpring', v)} 
                />
                <Stepper 
                  label={config.shockLength.label} value={formData.shockLength} previousValue={previousSession?.shockLength} 
                  min={config.shockLength.min} max={config.shockLength.max} step={config.shockLength.step} unit={config.shockLength.unit}
                  onChange={(v) => updateField('shockLength', v)} 
                />
              </div>
               <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border dark:border-slate-800">
                <h3 className="font-semibold text-slate-500 mb-4 text-xs uppercase tracking-wider">Misurazioni Sag</h3>
                <Stepper 
                  label={config.shockSagStatic.label} value={formData.shockSagStatic} previousValue={previousSession?.shockSagStatic} 
                  min={config.shockSagStatic.min} max={config.shockSagStatic.max} step={config.shockSagStatic.step} unit={config.shockSagStatic.unit}
                  onChange={(v) => updateField('shockSagStatic', v)} 
                />
                <Stepper 
                  label={config.shockSagDynamic.label} value={formData.shockSagDynamic} previousValue={previousSession?.shockSagDynamic} 
                  min={config.shockSagDynamic.min} max={config.shockSagDynamic.max} step={config.shockSagDynamic.step} unit={config.shockSagDynamic.unit}
                  onChange={(v) => updateField('shockSagDynamic', v)} 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- TAB CONTENT: GEOMETRIA --- */}
        <TabsContent value="geo" className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <Card className="dark:bg-slate-900 dark:border-slate-800">
            <CardHeader><CardTitle className="text-lg dark:text-slate-100">Geometria Telaio</CardTitle></CardHeader>
            <CardContent>
              <Stepper 
                label={config.wheelbase.label} 
                value={formData.wheelbase} 
                previousValue={previousSession?.wheelbase} 
                min={config.wheelbase.min} max={config.wheelbase.max} step={config.wheelbase.step} unit={config.wheelbase.unit}
                onChange={(v) => updateField('wheelbase', v)} 
              />
              <Stepper 
                label={config.rake.label} value={formData.rake} previousValue={previousSession?.rake} 
                min={config.rake.min} max={config.rake.max} step={config.rake.step} unit={config.rake.unit}
                onChange={(v) => updateField('rake', v)} 
              />
              <Stepper 
                label={config.trail.label} value={formData.trail} previousValue={previousSession?.trail} 
                min={config.trail.min} max={config.trail.max} step={config.trail.step} unit={config.trail.unit}
                onChange={(v) => updateField('trail', v)} 
              />
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </PageLayout>
  )
}