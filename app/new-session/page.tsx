"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client" 
import { toast } from "sonner" 
import { cn } from "@/lib/utils"

import { PageLayout } from "@/components/layout/page-layout"
import { Stepper } from "@/components/ui/stepper"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList 
} from "@/components/ui/command"
import { 
  Popover, PopoverContent, PopoverTrigger 
} from "@/components/ui/popover"
import { 
  Save, Disc, ArrowDownToLine, ArrowUpFromLine, ClipboardList, Loader2, Check, ChevronsUpDown, 
  Clock, Gauge, User, Shirt, Timer
} from "lucide-react"

import { DEFAULT_CONFIG, AppConfig } from "@/lib/preferences"
import { SagCalculator } from "@/components/sag-calculator"

// --- TYPES ---
type SetupData = {
  sessionName: string;
  circuit: string;
  
  // Orari
  startTime: string;
  endTime: string;

  // Pesi
  riderWeight: number; // Peso corporeo base
  gearWeight: number;  // Peso attrezzatura

  // Performance (Questi non si copiano dalla vecchia sessione)
  bestLap: string;
  avgLap: string;
  idealLap: string;
  split1: string;
  split2: string;
  split3: string;
  topSpeed: number;

  // Gomme
  tiresModel: string;
  tirePressF: number;
  tirePressR: number;

  // Forcella
  forkModel: string;
  forkSpring: number;
  forkPreload: number;
  forkComp: number;
  forkReb: number;
  forkOilLevel: number;
  forkHeight: number;
  // Sag Forcella (Risultati)
  forkSagStatic: number;
  forkSagDynamic: number;
  // Sag Forcella (Misure Grezze)
  forkL1: number;
  forkL2: number;
  forkL3: number;

  // Mono
  shockModel: string;
  shockSpring: number;
  shockPreload: number;
  shockComp: number;
  shockReb: number;
  shockLength: number;
  // Sag Mono (Risultati)
  shockSagStatic: number;
  shockSagDynamic: number;
  // Sag Mono (Misure Grezze)
  shockL1: number;
  shockL2: number;
  shockL3: number;

  // Geo & Note
  wheelbase: number;
  rake: number;
  trail: number;
  notes: string;
}

const DEFAULT_DATA: SetupData = {
  sessionName: "Nuova Sessione",
  circuit: "",
  startTime: "",
  endTime: "",
  riderWeight: 75,
  gearWeight: 10,
  
  bestLap: "",
  avgLap: "",
  idealLap: "",
  split1: "", split2: "", split3: "",
  topSpeed: 0,

  tiresModel: "Pirelli SC1",
  tirePressF: 2.1, tirePressR: 1.6,
  
  forkModel: "Standard",
  forkSpring: 10.0, forkPreload: 5, forkComp: 10, forkReb: 10, forkOilLevel: 140, forkHeight: 2,
  forkSagStatic: 0, forkSagDynamic: 0,
  forkL1: 0, forkL2: 0, forkL3: 0,

  shockModel: "Standard",
  shockSpring: 95, shockPreload: 10, shockComp: 10, shockReb: 10, shockLength: 315,
  shockSagStatic: 0, shockSagDynamic: 0,
  shockL1: 0, shockL2: 0, shockL3: 0,

  wheelbase: 1400, rake: 24.0, trail: 100,
  notes: ""
}

export default function NewSessionPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [bikeId, setBikeId] = useState<string | null>(null)
  
  const [circuits, setCircuits] = useState<string[]>([])
  const [openCircuitCombo, setOpenCircuitCombo] = useState(false)

  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG)
  
  // STATO CORRENTE (Quello che modifichi)
  const [formData, setFormData] = useState<SetupData>(DEFAULT_DATA)
  
  // DATI DI RIFERIMENTO (Snapshot della sessione precedente per confronto)
  const [referenceData, setReferenceData] = useState<SetupData | null>(null)
  
  const totalWeight = (formData.riderWeight || 0) + (formData.gearWeight || 0)

  // --- 1. CARICAMENTO DATI ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        const userId = user?.id

        if (userId) {
          // A. Configurazione
          const { data: prefData } = await supabase.from('user_preferences').select('config').eq('user_id', userId).single()
          if (prefData?.config) setConfig({ ...DEFAULT_CONFIG, ...prefData.config })

          // B. Moto Attiva
          let { data: bike } = await supabase.from('bikes').select('*').eq('user_id', userId).eq('is_active', true).maybeSingle()
          if (!bike) {
             const { data: anyBike } = await supabase.from('bikes').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle()
             bike = anyBike
          }

          if (bike) {
            setBikeId(bike.id)

            // C. Circuiti
            const { data: circuitsData } = await supabase.from('circuits').select('name').eq('user_id', userId).order('name', { ascending: true })
            if (circuitsData) setCircuits(circuitsData.map(c => c.name))
            
            // D. Ultima Sessione (Per pre-popolare i dati setup)
            const { data: lastSessionData } = await supabase
              .from('sessions')
              .select(`*, track_days!inner ( bike_id, circuit_name )`)
              .eq('track_days.bike_id', bike.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle()

            if (lastSessionData) {
              // Mappiamo i dati dal DB al formato SetupData
              const technicalData = {
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
                forkL1: lastSessionData.fork_measure_l1 || 0,
                forkL2: lastSessionData.fork_measure_l2 || 0,
                forkL3: lastSessionData.fork_measure_l3 || 0,
                
                shockModel: lastSessionData.shock_model || "",
                shockSpring: lastSessionData.shock_spring,
                shockPreload: lastSessionData.shock_preload,
                shockComp: lastSessionData.shock_comp,
                shockReb: lastSessionData.shock_reb,
                shockLength: lastSessionData.shock_length,
                shockL1: lastSessionData.shock_measure_l1 || 0,
                shockL2: lastSessionData.shock_measure_l2 || 0,
                shockL3: lastSessionData.shock_measure_l3 || 0,
                
                wheelbase: lastSessionData.wheelbase,
                rake: lastSessionData.rake,
                trail: lastSessionData.trail
              }

              // 1. Popoliamo il form corrente (senza tempi)
              setFormData(prev => ({
                ...prev,
                circuit: lastSessionData.track_days.circuit_name,
                ...technicalData,
                bestLap: "", avgLap: "", idealLap: "", 
                split1: "", split2: "", split3: "", topSpeed: 0
              }))

              // 2. Salviamo il riferimento (Per i "previousValue" degli stepper)
              setReferenceData({
                ...DEFAULT_DATA,
                ...technicalData
              })
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
      toast.error("Nessuna moto", { description: "Devi avere una moto nel Garage." })
      return
    }
    if (!formData.circuit) {
      toast.error("Circuito mancante", { description: "Seleziona o scrivi un nome circuito." })
      return
    }
    setSaving(true)

    try {
      const today = new Date().toISOString().split('T')[0]
      
      // 1. Cerca o Crea Track Day
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
      
      if (!trackDay) throw new Error("Errore creazione giornata.")

      // 2. Calcola numero sessione
      const { count } = await supabase
        .from('sessions')
        .select('*', { count: 'exact', head: true })
        .eq('track_day_id', trackDay.id)
      
      const nextSessionNumber = (count || 0) + 1
      const finalName = formData.sessionName === "Nuova Sessione" 
        ? `Turno ${nextSessionNumber}` 
        : formData.sessionName

      // 3. Inserisci Sessione
      const { error } = await supabase.from('sessions').insert({
        track_day_id: trackDay.id,
        name: finalName,
        session_number: nextSessionNumber,
        
        start_time: formData.startTime || null,
        end_time: formData.endTime || null,
        gear_weight: formData.gearWeight,

        best_lap: formData.bestLap,
        avg_lap: formData.avgLap,
        ideal_lap: formData.idealLap,
        split_1: formData.split1,
        split_2: formData.split2,
        split_3: formData.split3,
        top_speed: formData.topSpeed,

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
        fork_measure_l1: formData.forkL1,
        fork_measure_l2: formData.forkL2,
        fork_measure_l3: formData.forkL3,

        shock_model: formData.shockModel,
        shock_spring: formData.shockSpring,
        shock_preload: formData.shockPreload,
        shock_comp: formData.shockComp,
        shock_reb: formData.shockReb,
        shock_length: formData.shockLength,
        shock_sag_static: formData.shockSagStatic,
        shock_sag_dynamic: formData.shockSagDynamic,
        shock_measure_l1: formData.shockL1,
        shock_measure_l2: formData.shockL2,
        shock_measure_l3: formData.shockL3,

        wheelbase: formData.wheelbase,
        rake: formData.rake,
        trail: formData.trail,
        
        notes: formData.notes
      })

      if (error) throw error

      toast.success("Turno Salvato! 🏁")
      setTimeout(() => { router.push('/'); router.refresh() }, 1000)
      
    } catch (error: any) {
      console.error(error)
      toast.error("Errore salvataggio", { description: error.message })
    } finally {
      setSaving(false)
    }
  }

  const saveButton = (
    <Button size="sm" onClick={handleSave} disabled={saving || loading} className="bg-green-600 hover:bg-green-700 text-white gap-2 h-9 px-3">
      {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
      <span className={saving ? "hidden" : "hidden xs:inline"}>{saving ? "" : "Salva Turno"}</span>
    </Button>
  )

  if (loading) return <PageLayout title="Nuova Sessione"><div className="pt-40 flex justify-center"><Loader2 className="animate-spin text-green-500" /></div></PageLayout>

  return (
    <PageLayout title="Nuovo Turno" rightAction={saveButton} showBackButton={true}>
      
      {/* HEADER */}
      <Card className="mb-4 dark:bg-slate-900 dark:border-slate-800">
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-500 text-xs uppercase">Nome Turno</Label>
              <Input 
                value={formData.sessionName} 
                onChange={(e) => updateField('sessionName', e.target.value)}
                className="font-bold text-lg mt-1 dark:bg-slate-950"
              />
            </div>
             <div className="space-y-1">
                <Label className="text-slate-500 text-xs uppercase">Circuito</Label>
                <Popover open={openCircuitCombo} onOpenChange={setOpenCircuitCombo}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" aria-expanded={openCircuitCombo} className="w-full justify-between dark:bg-slate-950 text-base font-normal">
                      {formData.circuit || "Seleziona circuito..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 dark:bg-slate-900">
                    <Command>
                      <CommandInput placeholder="Cerca..." />
                      <CommandList>
                        <CommandEmpty>Premi Invio per "{formData.circuit}"</CommandEmpty>
                        <CommandGroup heading="Circuiti">
                          {circuits.map((circuit) => (
                            <CommandItem
                              key={circuit}
                              value={circuit}
                              onSelect={(currentValue) => {
                                updateField('circuit', currentValue)
                                setOpenCircuitCombo(false)
                              }}
                            >
                              <Check className={cn("mr-2 h-4 w-4", formData.circuit === circuit ? "opacity-100" : "opacity-0")} />
                              {circuit}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                        <CommandGroup heading="Nuovo">
                           <div className="p-2">
                             <Input 
                               placeholder="Digita nome..." 
                               className="h-9 text-sm" 
                               value={formData.circuit} 
                               onChange={(e) => updateField('circuit', e.target.value)}
                               onKeyDown={(e) => { if(e.key === 'Enter') setOpenCircuitCombo(false) }}
                             />
                           </div>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
          </div>

          {/* Orari */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
               <Label className="flex items-center gap-1 text-xs text-slate-500 uppercase"><Clock size={12}/> Inizio</Label>
               <Input type="time" className="dark:bg-slate-950" value={formData.startTime} onChange={e => updateField('startTime', e.target.value)} />
            </div>
            <div className="space-y-1">
               <Label className="flex items-center gap-1 text-xs text-slate-500 uppercase"><Clock size={12}/> Fine</Label>
               <Input type="time" className="dark:bg-slate-950" value={formData.endTime} onChange={e => updateField('endTime', e.target.value)} />
            </div>
          </div>

          {/* Peso */}
          <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border dark:border-slate-800">
            <div className="flex-1">
               <Label className="text-[10px] text-slate-500 flex items-center gap-1 mb-1"><User size={10}/> Pilota</Label>
               <Input 
                 type="number" 
                 className="h-8 text-sm bg-white dark:bg-slate-900" 
                 value={formData.riderWeight} 
                 onChange={e => updateField('riderWeight', parseFloat(e.target.value))} 
               />
            </div>
            <div className="text-slate-400 font-bold mt-4">+</div>
            <div className="flex-1">
               <Label className="text-[10px] text-slate-500 flex items-center gap-1 mb-1"><Shirt size={10}/> Kit</Label>
               <Input 
                 type="number" 
                 className="h-8 text-sm bg-white dark:bg-slate-900" 
                 value={formData.gearWeight} 
                 onChange={e => updateField('gearWeight', parseFloat(e.target.value))} 
               />
            </div>
            <div className="text-slate-400 font-bold mt-4">=</div>
            <div className="flex-1 text-right">
               <Label className="text-[10px] text-slate-500 mb-1 block">Totale</Label>
               <div className="h-8 flex items-center justify-end font-bold text-green-600 text-lg">{totalWeight} kg</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* --- TABS --- */}
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-5 h-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl shadow-sm mb-6">
           <TabsTrigger value="performance" className="flex flex-col gap-1 h-full rounded-lg data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-800 data-[state=active]:text-green-600 dark:data-[state=active]:text-green-400 transition-all font-bold"><Gauge size={18} /><span className="text-[9px] uppercase">Perf</span></TabsTrigger>
           <TabsTrigger value="tires" className="flex flex-col gap-1 h-full rounded-lg data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-800 data-[state=active]:text-green-600 dark:data-[state=active]:text-green-400 transition-all font-bold"><Disc size={18} /><span className="text-[9px] uppercase">Gomme</span></TabsTrigger>
           <TabsTrigger value="fork" className="flex flex-col gap-1 h-full rounded-lg data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-800 data-[state=active]:text-green-600 dark:data-[state=active]:text-green-400 transition-all font-bold"><ArrowDownToLine size={18} /><span className="text-[9px] uppercase">Forca</span></TabsTrigger>
           <TabsTrigger value="shock" className="flex flex-col gap-1 h-full rounded-lg data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-800 data-[state=active]:text-green-600 dark:data-[state=active]:text-green-400 transition-all font-bold"><ArrowUpFromLine size={18} /><span className="text-[9px] uppercase">Mono</span></TabsTrigger>
           <TabsTrigger value="geo" className="flex flex-col gap-1 h-full rounded-lg data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-800 data-[state=active]:text-green-600 dark:data-[state=active]:text-green-400 transition-all font-bold"><ClipboardList size={18} /><span className="text-[9px] uppercase">Note</span></TabsTrigger>
        </TabsList>

        {/* 1. PERFORMANCE */}
        <TabsContent value="performance" className="space-y-4">
           <Card className="dark:bg-slate-900 dark:border-slate-800">
             <CardHeader><CardTitle className="text-lg">Tempi e Velocità</CardTitle></CardHeader>
             <CardContent className="space-y-6">
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label className="text-green-600 font-bold flex items-center gap-2"><Timer size={14}/> Best Lap</Label>
                   <Input placeholder="1:58.340" value={formData.bestLap} onChange={e => updateField('bestLap', e.target.value)} className="font-mono text-xl py-6 border-green-500/30" />
                 </div>
                 <div className="space-y-2">
                   <Label>Passo Medio</Label>
                   <Input placeholder="2:00.100" value={formData.avgLap} onChange={e => updateField('avgLap', e.target.value)} className="font-mono py-6" />
                 </div>
               </div>
               
               <div className="space-y-2">
                  <Label>Ideal Lap (Somma Split)</Label>
                  <Input placeholder="1:57.900" value={formData.idealLap} onChange={e => updateField('idealLap', e.target.value)} className="font-mono bg-slate-50 dark:bg-slate-950 border-dashed" />
               </div>

               <div className="grid grid-cols-3 gap-3 pt-2">
                 <div className="space-y-1"><Label className="text-[10px] uppercase text-slate-500">Split 1</Label><Input className="h-9 font-mono text-sm" value={formData.split1} onChange={e => updateField('split1', e.target.value)} /></div>
                 <div className="space-y-1"><Label className="text-[10px] uppercase text-slate-500">Split 2</Label><Input className="h-9 font-mono text-sm" value={formData.split2} onChange={e => updateField('split2', e.target.value)} /></div>
                 <div className="space-y-1"><Label className="text-[10px] uppercase text-slate-500">Split 3</Label><Input className="h-9 font-mono text-sm" value={formData.split3} onChange={e => updateField('split3', e.target.value)} /></div>
               </div>

               <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                 <Label>Velocità Massima (km/h)</Label>
                 <Input type="number" placeholder="299" value={formData.topSpeed || ""} onChange={e => updateField('topSpeed', parseFloat(e.target.value))} className="mt-1 font-bold" />
               </div>
             </CardContent>
           </Card>
        </TabsContent>

        {/* 2. GOMME */}
        <TabsContent value="tires" className="space-y-4">
           <Card className="dark:bg-slate-900 dark:border-slate-800">
            <CardHeader><CardTitle className="text-lg">Pneumatici</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-slate-500">Marca/Modello</Label>
                <Input value={formData.tiresModel} onChange={(e) => updateField('tiresModel', e.target.value)} className="mt-1 dark:bg-slate-950" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Stepper 
                  label={config.tirePressF.label} 
                  value={formData.tirePressF} 
                  previousValue={referenceData?.tirePressF}
                  min={config.tirePressF.min} max={config.tirePressF.max} step={config.tirePressF.step} unit={config.tirePressF.unit} onChange={(v) => updateField('tirePressF', v)} 
                />
                <Stepper 
                  label={config.tirePressR.label} 
                  value={formData.tirePressR} 
                  previousValue={referenceData?.tirePressR}
                  min={config.tirePressR.min} max={config.tirePressR.max} step={config.tirePressR.step} unit={config.tirePressR.unit} onChange={(v) => updateField('tirePressR', v)} 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. FORCELLA */}
        <TabsContent value="fork" className="space-y-4">
          <Card className="dark:bg-slate-900 dark:border-slate-800">
            <CardHeader><CardTitle className="text-lg">Forcella</CardTitle></CardHeader>
            <CardContent className="space-y-1">
              
              <div className="mb-6">
                <SagCalculator 
                  type="fork"
                  initialL1={formData.forkL1}
                  initialL2={formData.forkL2}
                  initialL3={formData.forkL3}
                  referenceL1={referenceData?.forkL1}
                  referenceL2={referenceData?.forkL2}
                  referenceL3={referenceData?.forkL3}
                  onChange={(staticVal, riderVal, measures) => {
                     updateField('forkSagStatic', staticVal)
                     updateField('forkSagDynamic', riderVal)
                     updateField('forkL1', measures.l1)
                     updateField('forkL2', measures.l2)
                     updateField('forkL3', measures.l3)
                  }}
               />
              </div>

              <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border dark:border-slate-800">
                <h3 className="font-semibold text-slate-500 mb-4 text-xs uppercase tracking-wider">Idraulica</h3>
                <Stepper 
                   label={config.forkComp.label} 
                   value={formData.forkComp} 
                   previousValue={referenceData?.forkComp}
                   min={config.forkComp.min} max={config.forkComp.max} step={config.forkComp.step} unit={config.forkComp.unit} onChange={(v) => updateField('forkComp', v)} 
                />
                <Stepper 
                   label={config.forkReb.label} 
                   value={formData.forkReb} 
                   previousValue={referenceData?.forkReb}
                   min={config.forkReb.min} max={config.forkReb.max} step={config.forkReb.step} unit={config.forkReb.unit} onChange={(v) => updateField('forkReb', v)} 
                />
              </div>

              <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border dark:border-slate-800">
                <h3 className="font-semibold text-slate-500 mb-4 text-xs uppercase tracking-wider">Meccanica</h3>
                <Stepper 
                   label={config.forkPreload.label} 
                   value={formData.forkPreload} 
                   previousValue={referenceData?.forkPreload}
                   min={config.forkPreload.min} max={config.forkPreload.max} step={config.forkPreload.step} unit={config.forkPreload.unit} onChange={(v) => updateField('forkPreload', v)} 
                />
                <Stepper 
                   label={config.forkSpring.label} 
                   value={formData.forkSpring} 
                   previousValue={referenceData?.forkSpring}
                   min={config.forkSpring.min} max={config.forkSpring.max} step={config.forkSpring.step} unit={config.forkSpring.unit} onChange={(v) => updateField('forkSpring', v)} 
                />
                <Stepper 
                   label={config.forkOilLevel.label} 
                   value={formData.forkOilLevel} 
                   previousValue={referenceData?.forkOilLevel}
                   min={config.forkOilLevel.min} max={config.forkOilLevel.max} step={config.forkOilLevel.step} unit={config.forkOilLevel.unit} onChange={(v) => updateField('forkOilLevel', v)} 
                />
                <Stepper 
                   label={config.forkHeight.label} 
                   value={formData.forkHeight} 
                   previousValue={referenceData?.forkHeight}
                   min={config.forkHeight.min} max={config.forkHeight.max} step={config.forkHeight.step} unit={config.forkHeight.unit} onChange={(v) => updateField('forkHeight', v)} 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. MONO */}
        <TabsContent value="shock" className="space-y-4">
          <Card className="dark:bg-slate-900 dark:border-slate-800">
            <CardHeader><CardTitle className="text-lg">Mono</CardTitle></CardHeader>
            <CardContent className="space-y-1">
               
               <div className="mb-6">
                <SagCalculator 
                  type="shock"
                  initialL1={formData.shockL1}
                  initialL2={formData.shockL2}
                  initialL3={formData.shockL3}
                  referenceL1={referenceData?.shockL1}
                  referenceL2={referenceData?.shockL2}
                  referenceL3={referenceData?.shockL3}
                  onChange={(staticVal, riderVal, measures) => {
                     updateField('shockSagStatic', staticVal)
                     updateField('shockSagDynamic', riderVal)
                     updateField('shockL1', measures.l1)
                     updateField('shockL2', measures.l2)
                     updateField('shockL3', measures.l3)
                  }}
               />
              </div>

              <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border dark:border-slate-800">
                <h3 className="font-semibold text-slate-500 mb-4 text-xs uppercase tracking-wider">Idraulica</h3>
                <Stepper 
                   label={config.shockComp.label} 
                   value={formData.shockComp} 
                   previousValue={referenceData?.shockComp}
                   min={config.shockComp.min} max={config.shockComp.max} step={config.shockComp.step} unit={config.shockComp.unit} onChange={(v) => updateField('shockComp', v)} 
                />
                <Stepper 
                   label={config.shockReb.label} 
                   value={formData.shockReb} 
                   previousValue={referenceData?.shockReb}
                   min={config.shockReb.min} max={config.shockReb.max} step={config.shockReb.step} unit={config.shockReb.unit} onChange={(v) => updateField('shockReb', v)} 
                />
              </div>
              <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border dark:border-slate-800">
                <h3 className="font-semibold text-slate-500 mb-4 text-xs uppercase tracking-wider">Meccanica</h3>
                <Stepper 
                   label={config.shockPreload.label} 
                   value={formData.shockPreload} 
                   previousValue={referenceData?.shockPreload}
                   min={config.shockPreload.min} max={config.shockPreload.max} step={config.shockPreload.step} unit={config.shockPreload.unit} onChange={(v) => updateField('shockPreload', v)} 
                />
                <Stepper 
                   label={config.shockSpring.label} 
                   value={formData.shockSpring} 
                   previousValue={referenceData?.shockSpring}
                   min={config.shockSpring.min} max={config.shockSpring.max} step={config.shockSpring.step} unit={config.shockSpring.unit} onChange={(v) => updateField('shockSpring', v)} 
                />
                <Stepper 
                   label={config.shockLength.label} 
                   value={formData.shockLength} 
                   previousValue={referenceData?.shockLength}
                   min={config.shockLength.min} max={config.shockLength.max} step={config.shockLength.step} unit={config.shockLength.unit} onChange={(v) => updateField('shockLength', v)} 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. GEO E NOTE */}
        <TabsContent value="geo" className="space-y-4">
          <Card className="dark:bg-slate-900 dark:border-slate-800">
            <CardHeader><CardTitle className="text-lg">Geometria e Note</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border dark:border-slate-800">
                <Stepper 
                   label={config.wheelbase.label} 
                   value={formData.wheelbase} 
                   previousValue={referenceData?.wheelbase}
                   step={1} min={1000} max={2000} unit="mm" onChange={(v) => updateField('wheelbase', v)} 
                />
                <Stepper 
                   label={config.rake.label} 
                   value={formData.rake} 
                   previousValue={referenceData?.rake}
                   step={0.1} unit="deg" onChange={(v) => updateField('rake', v)} 
                />
                <Stepper 
                   label={config.trail.label} 
                   value={formData.trail} 
                   previousValue={referenceData?.trail}
                   step={1} unit="mm" onChange={(v) => updateField('trail', v)} 
                />
              </div>
              
              <div className="space-y-2">
                 <Label>Note Sessione / Feedback</Label>
                 <Textarea 
                   value={formData.notes} 
                   onChange={e => updateField('notes', e.target.value)} 
                   placeholder="Sensazioni alla guida, problemi riscontrati..." 
                   className="h-32 dark:bg-slate-950"
                 />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  )
}