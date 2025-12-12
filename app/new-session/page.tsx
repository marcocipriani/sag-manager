"use client"

import { useState } from "react"
import { PageLayout } from "@/components/layout/page-layout"
import { Stepper } from "@/components/ui/stepper"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Save, 
  ClipboardList, 
  Disc, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  Ruler 
} from "lucide-react"

// --- TYPES ---
// Full data structure based on your paper sheet
type SetupData = {
  // Session Info
  sessionName: string;
  
  // General Data
  bikeModel: string;
  riderWeight: number;
  circuit: string;
  
  // Tires
  tiresModel: string;
  tirePressF: number;
  tirePressR: number;

  // Fork (Front)
  forkModel: string;
  forkSpring: number;
  forkPreload: number;
  forkComp: number;
  forkReb: number;
  forkOilLevel: number;
  forkHeight: number;
  forkSagStatic: number;
  forkSagDynamic: number;

  // Shock (Rear)
  shockModel: string;
  shockSpring: number;
  shockPreload: number;
  shockComp: number;
  shockReb: number;
  shockLength: number;
  shockSagStatic: number;
  shockSagDynamic: number;

  // Geometry
  wheelbase: number;
  rake: number;
  trail: number;
}

// --- MOCK DATA ---
// Simulating data fetched from Supabase (The previous session to inherit from)
const PREVIOUS_SESSION: SetupData = {
  sessionName: "Sessione 1",
  bikeModel: "Yamaha R1 2019",
  riderWeight: 75,
  circuit: "Vallelunga",
  tiresModel: "Pirelli SC1",
  tirePressF: 2.3,
  tirePressR: 1.6,
  forkModel: "Öhlins FGRT",
  forkSpring: 10.0,
  forkPreload: 8,
  forkComp: 12,
  forkReb: 10,
  forkOilLevel: 140,
  forkHeight: 2,
  forkSagStatic: 25,
  forkSagDynamic: 38,
  shockModel: "Öhlins TTX",
  shockSpring: 95,
  shockPreload: 12,
  shockComp: 14,
  shockReb: 12,
  shockLength: 315,
  shockSagStatic: 10,
  shockSagDynamic: 30,
  wheelbase: 1405,
  rake: 24.0,
  trail: 102
}

export default function NewSessionPage() {
  // --- STATE ---
  // Initialize state with previous session data (Inheritance logic)
  // Only 'sessionName' is reset for the new entry
  const [formData, setFormData] = useState<SetupData>({
    ...PREVIOUS_SESSION,
    sessionName: "Sessione 2 (Corrente)" 
  })

  // Helper to update specific fields
  const updateField = (field: keyof SetupData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // --- ACTIONS ---
  const handleSave = () => {
    console.log("Saving data to Supabase...", formData)
    // TODO: Add Supabase INSERT logic here
  }

  // Header Action Button
  const saveButton = (
    <Button 
      size="sm" 
      onClick={handleSave} 
      className="bg-green-600 hover:bg-green-700 text-white gap-2 shadow-sm transition-colors"
    >
      <Save size={16} /> <span className="hidden sm:inline">Salva</span>
    </Button>
  )

  return (
    <PageLayout title="Nuova Sessione" action={saveButton}>
      
      {/* 1. QUICK SESSION INFO */}
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

      {/* 2. NAVIGATION TABS */}
      <Tabs defaultValue="fork" className="w-full">
        
        {/* Scrollable Tab List with Icons */}
        <TabsList className="flex w-full overflow-x-auto h-14 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-xl shadow-sm mb-6 justify-start gap-1 scrollbar-hide">
           
           <TabsTrigger value="general" className="px-3 h-full gap-2 data-[state=active]:bg-slate-900 dark:data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-lg transition-all flex items-center min-w-fit">
             <ClipboardList size={18} strokeWidth={2} />
             <span>Gen</span>
           </TabsTrigger>

           <TabsTrigger value="tires" className="px-3 h-full gap-2 data-[state=active]:bg-slate-900 dark:data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-lg transition-all flex items-center min-w-fit">
             <Disc size={18} strokeWidth={2} />
             <span>Gomme</span>
           </TabsTrigger>

           <TabsTrigger value="fork" className="px-3 h-full gap-2 data-[state=active]:bg-slate-900 dark:data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-lg transition-all flex items-center min-w-fit">
             <ArrowDownToLine size={18} strokeWidth={2} />
             <span>Forcella</span>
           </TabsTrigger>

           <TabsTrigger value="shock" className="px-3 h-full gap-2 data-[state=active]:bg-slate-900 dark:data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-lg transition-all flex items-center min-w-fit">
             <ArrowUpFromLine size={18} strokeWidth={2} />
             <span>Mono</span>
           </TabsTrigger>

           <TabsTrigger value="geo" className="px-3 h-full gap-2 data-[state=active]:bg-slate-900 dark:data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-lg transition-all flex items-center min-w-fit">
             <Ruler size={18} strokeWidth={2} />
             <span>Geo</span>
           </TabsTrigger>

        </TabsList>

        {/* --- TAB CONTENT: GENERAL --- */}
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
                   <Input value={formData.circuit} disabled className="bg-slate-100 dark:bg-slate-800 dark:border-slate-700 mt-1" />
                </div>
              </div>
              <Stepper 
                label="Peso Pilota" 
                value={formData.riderWeight} 
                previousValue={PREVIOUS_SESSION.riderWeight} 
                unit="kg" 
                onChange={(v) => updateField('riderWeight', v)} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- TAB CONTENT: TIRES --- */}
        <TabsContent value="tires" className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
           <Card className="dark:bg-slate-900 dark:border-slate-800">
            <CardHeader><CardTitle className="text-lg dark:text-slate-100">Pneumatici</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-slate-500">Marca/Modello</Label>
                <Input 
                   value={formData.tiresModel} 
                   onChange={(e) => updateField('tiresModel', e.target.value)}
                   className="mt-1 dark:bg-slate-950 dark:border-slate-700" 
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Stepper label="Press. Anteriore" value={formData.tirePressF} previousValue={PREVIOUS_SESSION.tirePressF} step={0.1} unit="bar" onChange={(v) => updateField('tirePressF', v)} />
                <Stepper label="Press. Posteriore" value={formData.tirePressR} previousValue={PREVIOUS_SESSION.tirePressR} step={0.1} unit="bar" onChange={(v) => updateField('tirePressR', v)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- TAB CONTENT: FORK (FRONT) --- */}
        <TabsContent value="fork" className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <Card className="dark:bg-slate-900 dark:border-slate-800">
            <CardHeader><CardTitle className="text-lg dark:text-slate-100">Forcella (Anteriore)</CardTitle></CardHeader>
            <CardContent className="space-y-1">
              
              {/* Hydraulics Section */}
              <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border dark:border-slate-800">
                <h3 className="font-semibold text-slate-500 mb-4 text-xs uppercase tracking-wider">Idraulica</h3>
                <Stepper label="Compressione" value={formData.forkComp} previousValue={PREVIOUS_SESSION.forkComp} unit="click" onChange={(v) => updateField('forkComp', v)} />
                <Stepper label="Rebound (Estensione)" value={formData.forkReb} previousValue={PREVIOUS_SESSION.forkReb} unit="click" onChange={(v) => updateField('forkReb', v)} />
              </div>

              {/* Mechanics Section */}
              <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border dark:border-slate-800">
                <h3 className="font-semibold text-slate-500 mb-4 text-xs uppercase tracking-wider">Meccanica</h3>
                <Stepper label="Precarico Molla" value={formData.forkPreload} previousValue={PREVIOUS_SESSION.forkPreload} unit="giri" onChange={(v) => updateField('forkPreload', v)} />
                <Stepper label="Molla (K)" value={formData.forkSpring} previousValue={PREVIOUS_SESSION.forkSpring} step={0.5} unit="N/mm" onChange={(v) => updateField('forkSpring', v)} />
                <Stepper label="Livello Olio" value={formData.forkOilLevel} previousValue={PREVIOUS_SESSION.forkOilLevel} step={5} unit="mm" onChange={(v) => updateField('forkOilLevel', v)} />
                <Stepper label="Altezza (Sfilamento)" value={formData.forkHeight} previousValue={PREVIOUS_SESSION.forkHeight} unit="tacche" onChange={(v) => updateField('forkHeight', v)} />
              </div>

              {/* Sag Measurements */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border dark:border-slate-800">
                <h3 className="font-semibold text-slate-500 mb-4 text-xs uppercase tracking-wider">Misurazioni Sag</h3>
                <Stepper label="Sag Statico" value={formData.forkSagStatic} previousValue={PREVIOUS_SESSION.forkSagStatic} unit="mm" onChange={(v) => updateField('forkSagStatic', v)} />
                <Stepper label="Sag Dinamico" value={formData.forkSagDynamic} previousValue={PREVIOUS_SESSION.forkSagDynamic} unit="mm" onChange={(v) => updateField('forkSagDynamic', v)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- TAB CONTENT: SHOCK (REAR) --- */}
        <TabsContent value="shock" className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <Card className="dark:bg-slate-900 dark:border-slate-800">
            <CardHeader><CardTitle className="text-lg dark:text-slate-100">Mono (Posteriore)</CardTitle></CardHeader>
            <CardContent className="space-y-1">
               
               {/* Hydraulics Section */}
               <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border dark:border-slate-800">
                <h3 className="font-semibold text-slate-500 mb-4 text-xs uppercase tracking-wider">Idraulica</h3>
                <Stepper label="Compressione" value={formData.shockComp} previousValue={PREVIOUS_SESSION.shockComp} unit="click" onChange={(v) => updateField('shockComp', v)} />
                <Stepper label="Rebound (Estensione)" value={formData.shockReb} previousValue={PREVIOUS_SESSION.shockReb} unit="click" onChange={(v) => updateField('shockReb', v)} />
              </div>

              {/* Mechanics Section */}
              <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border dark:border-slate-800">
                <h3 className="font-semibold text-slate-500 mb-4 text-xs uppercase tracking-wider">Meccanica</h3>
                <Stepper label="Precarico Molla" value={formData.shockPreload} previousValue={PREVIOUS_SESSION.shockPreload} unit="mm" onChange={(v) => updateField('shockPreload', v)} />
                <Stepper label="Molla (K)" value={formData.shockSpring} previousValue={PREVIOUS_SESSION.shockSpring} step={5} unit="N/mm" onChange={(v) => updateField('shockSpring', v)} />
                <Stepper label="Interasse (Lunghezza)" value={formData.shockLength} previousValue={PREVIOUS_SESSION.shockLength} step={0.5} unit="mm" onChange={(v) => updateField('shockLength', v)} />
              </div>

               {/* Sag Measurements */}
               <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border dark:border-slate-800">
                <h3 className="font-semibold text-slate-500 mb-4 text-xs uppercase tracking-wider">Misurazioni Sag</h3>
                <Stepper label="Sag Statico" value={formData.shockSagStatic} previousValue={PREVIOUS_SESSION.shockSagStatic} unit="mm" onChange={(v) => updateField('shockSagStatic', v)} />
                <Stepper label="Sag Dinamico" value={formData.shockSagDynamic} previousValue={PREVIOUS_SESSION.shockSagDynamic} unit="mm" onChange={(v) => updateField('shockSagDynamic', v)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- TAB CONTENT: GEOMETRY --- */}
        <TabsContent value="geo" className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <Card className="dark:bg-slate-900 dark:border-slate-800">
            <CardHeader><CardTitle className="text-lg dark:text-slate-100">Geometria Telaio</CardTitle></CardHeader>
            <CardContent>
              <Stepper label="Interasse Totale" value={formData.wheelbase} previousValue={PREVIOUS_SESSION.wheelbase} step={1} unit="mm" onChange={(v) => updateField('wheelbase', v)} />
              <Stepper label="Inclinazione Cannotto" value={formData.rake} previousValue={PREVIOUS_SESSION.rake} step={0.1} unit="deg" onChange={(v) => updateField('rake', v)} />
              <Stepper label="Avancorsa (Trail)" value={formData.trail} previousValue={PREVIOUS_SESSION.trail} step={1} unit="mm" onChange={(v) => updateField('trail', v)} />
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </PageLayout>
  )
}