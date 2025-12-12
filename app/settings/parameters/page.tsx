"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { PageLayout } from "@/components/layout/page-layout"
import { DEFAULT_CONFIG, AppConfig, FieldConfig } from "@/lib/preferences"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2, Save, RotateCcw } from "lucide-react"

export default function ParametersPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG)

  // Carica preferenze salvate
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('user_preferences')
          .select('config')
          .eq('user_id', user.id)
          .single()
        
        if (data?.config) {
          // Uniamo i dati salvati con quelli di default per sicurezza (se aggiungiamo nuovi campi in futuro)
          setConfig({ ...DEFAULT_CONFIG, ...data.config })
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('user_preferences')
      .upsert({ user_id: user.id, config: config })

    setSaving(false)
    if (error) toast.error("Errore salvataggio")
    else toast.success("Parametri aggiornati!")
  }

  const handleChange = (key: string, field: keyof FieldConfig, value: string) => {
    setConfig(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: field === 'unit' ? value : Number(value)
      }
    }))
  }

  const resetToDefault = () => {
    if(confirm("Vuoi ripristinare i valori predefiniti?")) {
      setConfig(DEFAULT_CONFIG)
    }
  }

  if (loading) return <PageLayout title="Parametri"><div className="pt-20 text-center"><Loader2 className="animate-spin inline" /></div></PageLayout>

  // Helper per renderizzare un blocco di configurazione
  const renderFieldConfig = (key: string, conf: FieldConfig) => (
    <div key={key} className="grid grid-cols-12 gap-2 items-end border-b border-slate-100 dark:border-slate-800 pb-4 last:border-0 last:pb-0">
      <div className="col-span-12 mb-1 font-semibold text-sm text-slate-700 dark:text-slate-300">{conf.label}</div>
      
      <div className="col-span-3">
        <Label className="text-[10px] text-slate-400">Min</Label>
        <Input type="number" value={conf.min} onChange={(e) => handleChange(key, 'min', e.target.value)} className="h-8 text-xs" />
      </div>
      <div className="col-span-3">
        <Label className="text-[10px] text-slate-400">Max</Label>
        <Input type="number" value={conf.max} onChange={(e) => handleChange(key, 'max', e.target.value)} className="h-8 text-xs" />
      </div>
      <div className="col-span-3">
        <Label className="text-[10px] text-slate-400">Step</Label>
        <Input type="number" value={conf.step} onChange={(e) => handleChange(key, 'step', e.target.value)} className="h-8 text-xs" />
      </div>
      <div className="col-span-3">
        <Label className="text-[10px] text-slate-400">Unità</Label>
        <Input type="text" value={conf.unit} onChange={(e) => handleChange(key, 'unit', e.target.value)} className="h-8 text-xs" />
      </div>
    </div>
  )

  const headerAction = (
    <Button size="sm" onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700 text-white">
      {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
    </Button>
  )

  return (
    <PageLayout title="Configurazione Campi" rightAction={headerAction} showBackButton>
      <div className="space-y-6 pb-20">
        
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={resetToDefault} className="text-xs text-slate-400 hover:text-red-500">
            <RotateCcw size={12} className="mr-1" /> Ripristina Default
          </Button>
        </div>

        {/* GRUPPO FORCELLA */}
        <Card>
          <CardHeader><CardTitle>Forcella</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(config).filter(([k]) => k.startsWith('fork')).map(([k, c]) => renderFieldConfig(k, c))}
          </CardContent>
        </Card>

        {/* GRUPPO MONO */}
        <Card>
          <CardHeader><CardTitle>Mono</CardTitle></CardHeader>
          <CardContent className="space-y-4">
             {Object.entries(config).filter(([k]) => k.startsWith('shock')).map(([k, c]) => renderFieldConfig(k, c))}
          </CardContent>
        </Card>

         {/* ALTRI */}
         <Card>
          <CardHeader><CardTitle>Altro</CardTitle></CardHeader>
          <CardContent className="space-y-4">
             {Object.entries(config).filter(([k]) => !k.startsWith('fork') && !k.startsWith('shock')).map(([k, c]) => renderFieldConfig(k, c))}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}