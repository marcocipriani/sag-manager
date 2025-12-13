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
import { 
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList 
} from "@/components/ui/command"
import { 
  Popover, PopoverContent, PopoverTrigger 
} from "@/components/ui/popover"
import { 
  Save, ClipboardList, Disc, ArrowDownToLine, ArrowUpFromLine, Ruler, Loader2, Check, ChevronsUpDown 
} from "lucide-react"

import { DEFAULT_CONFIG, AppConfig } from "@/lib/preferences"

// --- TYPES ---
type SetupData = {
  sessionName: string;
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
  riderWeight: 75,
  circuit: "",
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
  
  const [activeBike, setActiveBike] = useState<any>(null)
  
  const [circuits, setCircuits] = useState<string[]>([])
  const [openCircuitCombo, setOpenCircuitCombo] = useState(false)

  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG)
  const [formData, setFormData] = useState<SetupData>(DEFAULT_DATA)
  const [previousSession, setPreviousSession] = useState<SetupData | undefined>(undefined)

  // --- 1. CARICAMENTO DATI ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        const userId = user?.id

        if (userId) {
          // A. Configurazione Utente
          const { data: prefData } = await supabase
            .from('user_preferences')
            .select('config')
            .eq('user_id', userId)
            .single()
          if (prefData?.config) setConfig({ ...DEFAULT_CONFIG, ...prefData.config })

          // B. Recupera Moto Attiva
          let { data: bike } = await supabase
            .from('bikes')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
            .maybeSingle()

          if (!bike) {
             const { data: anyBike } = await supabase
               .from('bikes')
               .select('*')
               .eq('user_id', userId)
               .order('created_at', { ascending: false })
               .limit(1)
               .maybeSingle()
             bike = anyBike
          }

          if (bike) {
            setBikeId(bike.id)
            setActiveBike(bike)

            // --- MODIFICA QUI ---
            // C. Recupera Circuiti dall'Anagrafica (Tabella 'circuits')
            const { data: circuitsData } = await supabase
              .from('circuits')
              .select('name')
              .eq('user_id', userId) // Filtra per utente
              .order('name', { ascending: true })
            
            if (circuitsData) {
              const trackNames = circuitsData.map(c => c.name)
              setCircuits(trackNames)
            }
            // --------------------
            
            // D. Ultima Sessione
            const { data: lastSessionData } = await supabase
              .from('sessions')
              .select(`*, track_days!inner ( bike_id, circuit_name )`)
              .eq('track_days.bike_id', bike.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle()

            if (lastSessionData) {
              const mappedData: SetupData = {
                sessionName: "Nuova Sessione",
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
               // Default circuito se esiste lista
               if (circuitsData && circuitsData.length > 0) {
                 setFormData(prev => ({ ...prev, circuit: circuitsData[0].name }))
               }
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

      const { count } = await supabase
        .from('sessions')
        .select('*', { count: 'exact', head: true })
        .eq('track_day_id', trackDay.id)
      
      const nextSessionNumber = (count || 0) + 1
      const finalName = formData.sessionName === "Nuova Sessione" 
        ? `Sessione ${nextSessionNumber}` 
        : formData.sessionName

      const { error } = await supabase.from('sessions').insert({
        track_day_id: trackDay.id,
        name: finalName,
        session_number: nextSessionNumber,
        
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
      })

      if (error) throw error

      toast.success("Setup Salvato! 🏁")
      setTimeout(() => { router.push('/'); router.refresh() }, 1000)
      
    } catch (error) {
      console.error(error)
      toast.error("Errore salvataggio")
    } finally {
      setSaving(false)
    }
  }

  const saveButton = (
    <Button size="sm" onClick={handleSave} disabled={saving || loading} className="bg-green-600 hover:bg-green-700 text-white gap-2 h-9 px-3">
      {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
      <span className={saving ? "hidden" : "hidden xs:inline"}>{saving ? "" : "Salva"}</span>
    </Button>
  )

  if (loading) return <PageLayout title="Nuova Sessione"><div className="pt-40 flex justify-center"><Loader2 className="animate-spin text-green-500" /></div></PageLayout>

  return (
    <PageLayout title="Nuova Sessione" rightAction={saveButton} showBackButton={true}>
      
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

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-5 h-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl shadow-sm mb-6">
           <TabsTrigger value="general" className="flex flex-col gap-1 h-full data-[state=active]:bg-slate-900 dark:data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-lg"><ClipboardList size={20} /><span className="text-[10px]">Generale</span></TabsTrigger>
           <TabsTrigger value="tires" className="flex flex-col gap-1 h-full data-[state=active]:bg-slate-900 dark:data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-lg"><Disc size={20} /><span className="text-[10px]">Gomme</span></TabsTrigger>
           <TabsTrigger value="fork" className="flex flex-col gap-1 h-full data-[state=active]:bg-slate-900 dark:data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-lg"><ArrowDownToLine size={20} /><span className="text-[10px]">Forcella</span></TabsTrigger>
           <TabsTrigger value="shock" className="flex flex-col gap-1 h-full data-[state=active]:bg-slate-900 dark:data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-lg"><ArrowUpFromLine size={20} /><span className="text-[10px]">Mono</span></TabsTrigger>
           <TabsTrigger value="geo" className="flex flex-col gap-1 h-full data-[state=active]:bg-slate-900 dark:data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-lg"><Ruler size={20} /><span className="text-[10px]">Geo</span></TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <Card className="dark:bg-slate-900 dark:border-slate-800">
            <CardHeader><CardTitle className="text-lg dark:text-slate-100">Dati Generali</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              
              <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-4 border dark:border-slate-800">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Moto Selezionata</span>
                  {activeBike?.is_active && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">ATTIVA</span>}
                </div>
                {activeBike ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Marca</span>
                      <span className="font-semibold text-sm dark:text-slate-200">{activeBike.brand}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Modello</span>
                      <span className="font-semibold text-sm dark:text-slate-200">{activeBike.model}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Anno</span>
                      <span className="font-semibold text-sm dark:text-slate-200">{activeBike.year}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Peso</span>
                      <span className="font-semibold text-sm dark:text-slate-200">{activeBike.weight ? `${activeBike.weight} kg` : "N/D"}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-red-500">Nessuna moto trovata</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Circuito</Label>
                <Popover open={openCircuitCombo} onOpenChange={setOpenCircuitCombo}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" aria-expanded={openCircuitCombo} className="w-full justify-between dark:bg-slate-950 dark:border-slate-700">
                      {formData.circuit || "Seleziona circuito..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 dark:bg-slate-900">
                    <Command>
                      <CommandInput placeholder="Cerca o scrivi nuovo..." />
                      <CommandList>
                        <CommandEmpty>
                           <div className="p-2 text-sm text-slate-500 text-center">
                             Non trovato. Scrivilo qui sotto:
                           </div>
                        </CommandEmpty>
                        <CommandGroup heading="I tuoi circuiti">
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
                        <CommandGroup heading="Nuovo / Altro">
                           <div className="p-2">
                             <Input 
                               placeholder="Digita nome circuito..." 
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

              <Stepper label="Peso Pilota" value={formData.riderWeight} previousValue={previousSession?.riderWeight} unit="kg" onChange={(v) => updateField('riderWeight', v)} />
            
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tires" className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
           <Card className="dark:bg-slate-900 dark:border-slate-800">
            <CardHeader><CardTitle className="text-lg dark:text-slate-100">Pneumatici</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-slate-500">Marca/Modello</Label>
                <Input value={formData.tiresModel} onChange={(e) => updateField('tiresModel', e.target.value)} className="mt-1 dark:bg-slate-950 dark:border-slate-700" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Stepper label={config.tirePressF.label} value={formData.tirePressF} previousValue={previousSession?.tirePressF} min={config.tirePressF.min} max={config.tirePressF.max} step={config.tirePressF.step} unit={config.tirePressF.unit} onChange={(v) => updateField('tirePressF', v)} />
                <Stepper label={config.tirePressR.label} value={formData.tirePressR} previousValue={previousSession?.tirePressR} min={config.tirePressR.min} max={config.tirePressR.max} step={config.tirePressR.step} unit={config.tirePressR.unit} onChange={(v) => updateField('tirePressR', v)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fork" className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <Card className="dark:bg-slate-900 dark:border-slate-800">
            <CardHeader><CardTitle className="text-lg dark:text-slate-100">Forcella (Anteriore)</CardTitle></CardHeader>
            <CardContent className="space-y-1">
              <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border dark:border-slate-800">
                <h3 className="font-semibold text-slate-500 mb-4 text-xs uppercase tracking-wider">Idraulica</h3>
                <Stepper label={config.forkComp.label} value={formData.forkComp} previousValue={previousSession?.forkComp} min={config.forkComp.min} max={config.forkComp.max} step={config.forkComp.step} unit={config.forkComp.unit} onChange={(v) => updateField('forkComp', v)} />
                <Stepper label={config.forkReb.label} value={formData.forkReb} previousValue={previousSession?.forkReb} min={config.forkReb.min} max={config.forkReb.max} step={config.forkReb.step} unit={config.forkReb.unit} onChange={(v) => updateField('forkReb', v)} />
              </div>
              <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border dark:border-slate-800">
                <h3 className="font-semibold text-slate-500 mb-4 text-xs uppercase tracking-wider">Meccanica</h3>
                <Stepper label={config.forkPreload.label} value={formData.forkPreload} previousValue={previousSession?.forkPreload} min={config.forkPreload.min} max={config.forkPreload.max} step={config.forkPreload.step} unit={config.forkPreload.unit} onChange={(v) => updateField('forkPreload', v)} />
                <Stepper label={config.forkSpring.label} value={formData.forkSpring} previousValue={previousSession?.forkSpring} min={config.forkSpring.min} max={config.forkSpring.max} step={config.forkSpring.step} unit={config.forkSpring.unit} onChange={(v) => updateField('forkSpring', v)} />
                <Stepper label={config.forkOilLevel.label} value={formData.forkOilLevel} previousValue={previousSession?.forkOilLevel} min={config.forkOilLevel.min} max={config.forkOilLevel.max} step={config.forkOilLevel.step} unit={config.forkOilLevel.unit} onChange={(v) => updateField('forkOilLevel', v)} />
                <Stepper label={config.forkHeight.label} value={formData.forkHeight} previousValue={previousSession?.forkHeight} min={config.forkHeight.min} max={config.forkHeight.max} step={config.forkHeight.step} unit={config.forkHeight.unit} onChange={(v) => updateField('forkHeight', v)} />
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border dark:border-slate-800">
                <h3 className="font-semibold text-slate-500 mb-4 text-xs uppercase tracking-wider">Misurazioni Sag</h3>
                <Stepper label={config.forkSagStatic.label} value={formData.forkSagStatic} previousValue={previousSession?.forkSagStatic} min={config.forkSagStatic.min} max={config.forkSagStatic.max} step={config.forkSagStatic.step} unit={config.forkSagStatic.unit} onChange={(v) => updateField('forkSagStatic', v)} />
                <Stepper label={config.forkSagDynamic.label} value={formData.forkSagDynamic} previousValue={previousSession?.forkSagDynamic} min={config.forkSagDynamic.min} max={config.forkSagDynamic.max} step={config.forkSagDynamic.step} unit={config.forkSagDynamic.unit} onChange={(v) => updateField('forkSagDynamic', v)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shock" className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <Card className="dark:bg-slate-900 dark:border-slate-800">
            <CardHeader><CardTitle className="text-lg dark:text-slate-100">Mono (Posteriore)</CardTitle></CardHeader>
            <CardContent className="space-y-1">
               <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border dark:border-slate-800">
                <h3 className="font-semibold text-slate-500 mb-4 text-xs uppercase tracking-wider">Idraulica</h3>
                <Stepper label={config.shockComp.label} value={formData.shockComp} previousValue={previousSession?.shockComp} min={config.shockComp.min} max={config.shockComp.max} step={config.shockComp.step} unit={config.shockComp.unit} onChange={(v) => updateField('shockComp', v)} />
                <Stepper label={config.shockReb.label} value={formData.shockReb} previousValue={previousSession?.shockReb} min={config.shockReb.min} max={config.shockReb.max} step={config.shockReb.step} unit={config.shockReb.unit} onChange={(v) => updateField('shockReb', v)} />
              </div>
              <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border dark:border-slate-800">
                <h3 className="font-semibold text-slate-500 mb-4 text-xs uppercase tracking-wider">Meccanica</h3>
                <Stepper label={config.shockPreload.label} value={formData.shockPreload} previousValue={previousSession?.shockPreload} min={config.shockPreload.min} max={config.shockPreload.max} step={config.shockPreload.step} unit={config.shockPreload.unit} onChange={(v) => updateField('shockPreload', v)} />
                <Stepper label={config.shockSpring.label} value={formData.shockSpring} previousValue={previousSession?.shockSpring} min={config.shockSpring.min} max={config.shockSpring.max} step={config.shockSpring.step} unit={config.shockSpring.unit} onChange={(v) => updateField('shockSpring', v)} />
                <Stepper label={config.shockLength.label} value={formData.shockLength} previousValue={previousSession?.shockLength} min={config.shockLength.min} max={config.shockLength.max} step={config.shockLength.step} unit={config.shockLength.unit} onChange={(v) => updateField('shockLength', v)} />
              </div>
               <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border dark:border-slate-800">
                <h3 className="font-semibold text-slate-500 mb-4 text-xs uppercase tracking-wider">Misurazioni Sag</h3>
                <Stepper label={config.shockSagStatic.label} value={formData.shockSagStatic} previousValue={previousSession?.shockSagStatic} min={config.shockSagStatic.min} max={config.shockSagStatic.max} step={config.shockSagStatic.step} unit={config.shockSagStatic.unit} onChange={(v) => updateField('shockSagStatic', v)} />
                <Stepper label={config.shockSagDynamic.label} value={formData.shockSagDynamic} previousValue={previousSession?.shockSagDynamic} min={config.shockSagDynamic.min} max={config.shockSagDynamic.max} step={config.shockSagDynamic.step} unit={config.shockSagDynamic.unit} onChange={(v) => updateField('shockSagDynamic', v)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geo" className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <Card className="dark:bg-slate-900 dark:border-slate-800">
            <CardHeader><CardTitle className="text-lg dark:text-slate-100">Geometria Telaio</CardTitle></CardHeader>
            <CardContent>
              <Stepper label={config.wheelbase.label} value={formData.wheelbase} previousValue={previousSession?.wheelbase} step={1} min={1000} max={2000} unit="mm" onChange={(v) => updateField('wheelbase', v)} />
              <Stepper label={config.rake.label} value={formData.rake} previousValue={previousSession?.rake} step={0.1} unit="deg" onChange={(v) => updateField('rake', v)} />
              <Stepper label={config.trail.label} value={formData.trail} previousValue={previousSession?.trail} step={1} unit="mm" onChange={(v) => updateField('trail', v)} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  )
}