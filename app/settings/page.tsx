"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { signout } from "@/app/login/actions"
import { useTheme } from "next-themes"
import { DEFAULT_CONFIG, AppConfig } from "@/lib/preferences"

import { PageLayout } from "@/components/layout/page-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select"
import { 
  User, LogOut, Moon, Sun, FileText, Shield, Sliders, Github, Loader2 
} from "lucide-react"
import { toast } from "sonner"

export default function SettingsPage() {
  const { setTheme, theme } = useTheme()
  const supabase = createClient()
  
  const [userEmail, setUserEmail] = useState("Caricamento...")
  const [pressureUnit, setPressureUnit] = useState("bar")
  const [loadingConfig, setLoadingConfig] = useState(true)

  // 1. Carica Dati Utente e Preferenze
  useEffect(() => {
    const init = async () => {
      // A. Utente
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        setUserEmail(user.email)
      }

      // B. Preferenze (Unità Gomme)
      if (user) {
        const { data } = await supabase
          .from('user_preferences')
          .select('config')
          .eq('user_id', user.id)
          .single()
        
        // Se troviamo una config, leggiamo l'unità dell'anteriore (assumiamo siano uguali)
        if (data?.config?.tirePressF?.unit) {
          setPressureUnit(data.config.tirePressF.unit.toLowerCase())
        }
      }
      setLoadingConfig(false)
    }
    init()
  }, [])

  // 2. Gestione Cambio Unità (Bar <-> Psi)
  // Questo aggiorna il DB e ricalcola anche i limiti Min/Max per non rompere gli stepper
  const handleUnitChange = async (newUnit: string) => {
    setPressureUnit(newUnit) // Aggiorna UI subito
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Recupera config attuale o usa default
    const { data } = await supabase.from('user_preferences').select('config').eq('user_id', user.id).single()
    let currentConfig: AppConfig = data?.config || DEFAULT_CONFIG

    // Definiamo i nuovi limiti in base all'unità scelta
    const isPsi = newUnit === 'psi'
    const newSettings = {
      unit: newUnit,
      min: isPsi ? 0 : 0,
      max: isPsi ? 60 : 5,    // 5 Bar o 60 Psi
      step: isPsi ? 0.5 : 0.1 // Step più largo per i Psi
    }

    // Aggiorniamo sia Anteriore che Posteriore
    const updatedConfig = {
      ...currentConfig,
      tirePressF: { ...currentConfig.tirePressF, ...newSettings },
      tirePressR: { ...currentConfig.tirePressR, ...newSettings }
    }

    // Salva su DB
    const { error } = await supabase
      .from('user_preferences')
      .upsert({ user_id: user.id, config: updatedConfig })

    if (error) toast.error("Errore aggiornamento unità")
    else toast.success(`Unità impostata su ${newUnit.toUpperCase()}`)
  }

  return (
    <PageLayout title="Impostazioni" showBackButton>
      
      {/* 1. UTENTE REALE */}
      <Card className="dark:bg-slate-900 dark:border-slate-800 mb-6">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center border-2 border-slate-200 dark:border-slate-700">
              <User size={32} className="text-slate-500 dark:text-slate-400" />
            </div>
            <div className="overflow-hidden">
              <CardTitle className="text-lg dark:text-white truncate">{userEmail}</CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                Profilo Pilota
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 2. PREFERENZE APP */}
      <Card className="dark:bg-slate-900 dark:border-slate-800 mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg dark:text-white">Preferenze</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          
          {/* TEMA */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-medium text-slate-900 dark:text-slate-200">Tema</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Chiaro o Scuro
              </div>
            </div>
            <div className="flex gap-2 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border dark:border-slate-800">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setTheme('light')}
                className={`h-8 w-8 rounded-md transition-all ${theme === 'light' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}
              >
                <Sun size={16} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setTheme('dark')}
                className={`h-8 w-8 rounded-md transition-all ${theme === 'dark' ? 'bg-slate-800 shadow-sm text-white' : 'text-slate-400'}`}
              >
                <Moon size={16} />
              </Button>
            </div>
          </div>

          <Separator className="dark:bg-slate-800" />
          
          {/* UNITÀ GOMME (Selettore) */}
          <div className="flex items-center justify-between">
             <div className="space-y-0.5">
              <div className="font-medium text-slate-900 dark:text-slate-200">Unità Pressione</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Gomme (Bar / Psi)
              </div>
            </div>
            <div className="w-24">
              {loadingConfig ? (
                <div className="h-9 w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-md" />
              ) : (
                <Select value={pressureUnit} onValueChange={handleUnitChange}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">Bar</SelectItem>
                    <SelectItem value="psi">Psi</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <Separator className="dark:bg-slate-800" />

          {/* LINK CONFIGURAZIONE AVANZATA */}
          <Link href="/settings/parameters">
            <Button variant="outline" className="w-full justify-start h-10 text-sm gap-2 border-slate-200 dark:border-slate-700">
              <Sliders size={16} /> Configurazione Campi Avanzata
            </Button>
          </Link>

        </CardContent>
      </Card>

      {/* 3. INFO LEGALI */}
      <Card className="dark:bg-slate-900 dark:border-slate-800 mb-8">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg dark:text-white">Dati</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          <Button variant="outline" disabled className="w-full justify-start gap-2 dark:border-slate-700 opacity-50">
            <FileText size={16} /> Esporta Backup (Presto)
          </Button>
          <Button variant="outline" disabled className="w-full justify-start gap-2 dark:border-slate-700 opacity-50">
            <Shield size={16} /> Privacy Policy
          </Button>
        </CardContent>
      </Card>

      {/* 4. LOGOUT */}
      <div className="pt-2 pb-8">
        <Button 
          variant="destructive" 
          onClick={() => signout()} 
          className="w-full bg-red-600 hover:bg-red-700 text-white gap-2 h-12 text-base shadow-sm rounded-xl"
        >
          <LogOut size={18} /> Disconnetti
        </Button>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400">SagManager v1.1.0</p>
          <div className="flex justify-center gap-2 mt-2 text-slate-400">
            <Github size={14} />
            <span className="text-xs">Open Source Project</span>
          </div>
        </div>
      </div>

    </PageLayout>
  )
}