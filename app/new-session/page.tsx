// src/app/new-session/page.tsx
"use client"

import { useState } from "react"
import { PageLayout } from "@/components/layout/page-layout"
import { Stepper } from "@/components/ui/stepper"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save } from "lucide-react"

export default function NewSessionPage() {
  // --- STATE MANAGEMENT ---
  // In a real scenario, this initial state might come from the previous session (inherited data)
  const [formData, setFormData] = useState({
    sessionName: "Sessione 1",
    tirePressF: 2.1,
    tirePressR: 1.4,
    forkComp: 12,
    forkReb: 10,
    forkPreload: 5,
    shockComp: 14,
    shockReb: 12,
    shockPreload: 10,
  })

  // Helper to update specific fields in the state object
  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // --- ACTIONS ---
  const handleSave = () => {
    console.log("Saving data to Supabase...", formData)
    // TODO: Add Supabase INSERT logic here
  }

  // The Action Button (Save) that will be passed to the Header
  const saveButton = (
    <Button 
      size="sm" 
      onClick={handleSave}
      className="bg-green-600 hover:bg-green-700 text-white gap-2 shadow-sm transition-colors"
    >
      <Save size={16} /> 
      <span className="hidden sm:inline">Salva</span>
    </Button>
  )

  // --- RENDER ---
  return (
    <PageLayout title="Nuova Sessione" action={saveButton}>
      
      {/* SECTION 1: SESSION INFO */}
      <Card className="mb-6 shadow-sm border-slate-200 dark:border-slate-800 dark:bg-slate-900">
        <CardContent className="pt-6">
          <Label className="text-slate-500 dark:text-slate-400">Nome Sessione / Orario</Label>
          <Input 
            value={formData.sessionName} 
            onChange={(e) => updateField('sessionName', e.target.value)}
            className="text-lg font-semibold mt-2 border-slate-300 dark:border-slate-700 dark:bg-slate-950 focus-visible:ring-slate-900 dark:focus-visible:ring-green-500"
          />
        </CardContent>
      </Card>

      {/* SECTION 2: TECHNICAL DATA (TABS) */}
      <Tabs defaultValue="tires" className="w-full">
        
        {/* Tab Navigation */}
        <TabsList className="grid w-full grid-cols-3 mb-6 h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl shadow-sm">
          <TabsTrigger 
            value="tires" 
            className="data-[state=active]:bg-slate-900 dark:data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-lg transition-all"
          >
            Gomme
          </TabsTrigger>
          <TabsTrigger 
            value="front" 
            className="data-[state=active]:bg-slate-900 dark:data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-lg transition-all"
          >
            Forcella
          </TabsTrigger>
          <TabsTrigger 
            value="rear" 
            className="data-[state=active]:bg-slate-900 dark:data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-lg transition-all"
          >
            Mono
          </TabsTrigger>
        </TabsList>

        {/* --- TAB CONTENT: TIRES --- */}
        <TabsContent value="tires" className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
           <Card className="shadow-sm border-slate-200 dark:border-slate-800 dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-lg dark:text-slate-100">Pressione Gomme (Bar)</CardTitle>
            </CardHeader>
            <CardContent>
              <Stepper 
                label="Anteriore" 
                value={formData.tirePressF} 
                step={0.1} unit="bar"
                onChange={(v) => updateField('tirePressF', v)} 
              />
              <Stepper 
                label="Posteriore" 
                value={formData.tirePressR} 
                step={0.1} unit="bar"
                onChange={(v) => updateField('tirePressR', v)} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- TAB CONTENT: FORK (FRONT) --- */}
        <TabsContent value="front" className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <Card className="shadow-sm border-slate-200 dark:border-slate-800 dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-lg dark:text-slate-100">Setup Forcella</CardTitle>
            </CardHeader>
            <CardContent>
              <Stepper 
                label="Compressione" 
                value={formData.forkComp} 
                unit="click"
                onChange={(v) => updateField('forkComp', v)} 
              />
              <Stepper 
                label="Rebound (Estensione)" 
                value={formData.forkReb} 
                unit="click"
                onChange={(v) => updateField('forkReb', v)} 
              />
               <Stepper 
                label="Precarico Molla" 
                value={formData.forkPreload} 
                unit="giri"
                onChange={(v) => updateField('forkPreload', v)} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- TAB CONTENT: SHOCK (REAR) --- */}
        <TabsContent value="rear" className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <Card className="shadow-sm border-slate-200 dark:border-slate-800 dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-lg dark:text-slate-100">Setup Mono</CardTitle>
            </CardHeader>
            <CardContent>
              <Stepper 
                label="Compressione" 
                value={formData.shockComp} 
                unit="click"
                onChange={(v) => updateField('shockComp', v)} 
              />
              <Stepper 
                label="Rebound (Estensione)" 
                value={formData.shockReb} 
                unit="click"
                onChange={(v) => updateField('shockReb', v)} 
              />
               <Stepper 
                label="Precarico Idraulico" 
                value={formData.shockPreload} 
                unit="mm"
                onChange={(v) => updateField('shockPreload', v)} 
              />
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </PageLayout>
  )
}