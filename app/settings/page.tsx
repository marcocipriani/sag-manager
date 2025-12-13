"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { signout } from "@/app/login/actions"
import { useTheme } from "next-themes"
import { DEFAULT_CONFIG, AppConfig } from "@/lib/preferences"
// @ts-ignore
import packageInfo from "../../package.json" 

import { PageLayout } from "@/components/layout/page-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select"
import { 
  User, LogOut, Moon, Sun, FileText, Shield, Sliders, Github, Loader2, Fingerprint, ChevronRight, BookOpen 
} from "lucide-react"
import { toast } from "sonner"
import { EditProfileDialog } from "./edit-profile-dialog"

export default function SettingsPage() {
  const { setTheme, theme } = useTheme()
  const supabase = createClient()
  
  // 1. STATO MOUNTED (Per fixare l'errore di idratazione)
  const [mounted, setMounted] = useState(false)

  const [user, setUser] = useState<{
    id: string
    email: string
    fullName: string | null
    avatarUrl: string | null
    lastSignIn: string | null
  } | null>(null)

  const [pressureUnit, setPressureUnit] = useState("bar")
  const [loadingConfig, setLoadingConfig] = useState(true)

  useEffect(() => {
    // Appena il componente è montato nel browser, impostiamo true
    setMounted(true)

    const init = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (authUser) {
        setUser({
          id: authUser.id,
          email: authUser.email || "Nessuna email",
          fullName: authUser.user_metadata?.full_name || authUser.user_metadata?.name || "Pilota",
          avatarUrl: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || null,
          lastSignIn: authUser.last_sign_in_at 
            ? new Date(authUser.last_sign_in_at).toLocaleString('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
            : "Primo accesso"
        })

        const { data } = await supabase
          .from('user_preferences')
          .select('config')
          .eq('user_id', authUser.id)
          .single()
        
        if (data?.config?.tirePressF?.unit) {
          setPressureUnit(data.config.tirePressF.unit.toLowerCase())
        }
      }
      setLoadingConfig(false)
    }
    init()
  }, [])

  const handleUnitChange = async (newUnit: string) => {
    setPressureUnit(newUnit)
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return

    const { data } = await supabase.from('user_preferences').select('config').eq('user_id', authUser.id).single()
    let currentConfig: AppConfig = data?.config || DEFAULT_CONFIG

    const isPsi = newUnit === 'psi'
    const newSettings = {
      unit: newUnit,
      min: isPsi ? 0 : 0,
      max: isPsi ? 60 : 5,
      step: isPsi ? 0.5 : 0.1
    }

    const updatedConfig = {
      ...currentConfig,
      tirePressF: { ...currentConfig.tirePressF, ...newSettings },
      tirePressR: { ...currentConfig.tirePressR, ...newSettings }
    }

    const { error } = await supabase
      .from('user_preferences')
      .upsert({ user_id: authUser.id, config: updatedConfig })

    if (error) toast.error("Errore aggiornamento unità")
    else toast.success(`Unità impostata su ${newUnit.toUpperCase()}`)
  }

  const handleProfileUpdate = (newName: string, newAvatarUrl: string | null) => {
    setUser((prev) => {
      if (!prev) return null
      return {
        ...prev,
        fullName: newName,
        avatarUrl: newAvatarUrl
      }
    })
  }

  return (
    <PageLayout title="Impostazioni" showBackButton>
      
      {/* 1. UTENTE REALE */}
      <Card className="dark:bg-slate-900 dark:border-slate-800 mb-6 overflow-hidden">
        <CardHeader className="pb-4 flex flex-row items-center gap-4">
          <div className="h-16 w-16 shrink-0 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center border-2 border-slate-200 dark:border-slate-700 overflow-hidden relative">
            {user?.avatarUrl ? (
              <Image 
                src={user.avatarUrl} 
                alt="Profile" 
                fill 
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <User size={32} className="text-slate-500 dark:text-slate-400" />
            )}
          </div>

          <div className="overflow-hidden">
            <CardTitle className="text-xl dark:text-white truncate">
              {user?.fullName || "Caricamento..."}
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400 text-xs mt-1 space-y-1">
              <p className="truncate font-medium">{user?.email}</p>
              <p className="flex items-center gap-1 opacity-80">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                Ultimo accesso: {user?.lastSignIn}
              </p>
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <EditProfileDialog 
            currentName={user?.fullName || ""} 
            currentAvatar={user?.avatarUrl || null}
            onProfileUpdate={handleProfileUpdate}
          />
        </CardContent>
      </Card>

      {/* 2. PREFERENZE APP */}
      <Card className="dark:bg-slate-900 dark:border-slate-800 mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg dark:text-white">Preferenze</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          
          {/* TEMA - CORRETTO PER EVITARE HYDRATION ERROR */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-medium text-slate-900 dark:text-slate-200">Tema</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Chiaro o Scuro</div>
            </div>
            <div className="flex gap-2 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border dark:border-slate-800">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setTheme('light')}
                // Usiamo 'mounted && theme' per assicurarci che il controllo avvenga solo lato client
                className={`h-8 w-8 rounded-md transition-all ${mounted && theme === 'light' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}
              >
                <Sun size={16} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setTheme('dark')}
                // Usiamo 'mounted && theme'
                className={`h-8 w-8 rounded-md transition-all ${mounted && theme === 'dark' ? 'bg-slate-800 shadow-sm text-white' : 'text-slate-400'}`}
              >
                <Moon size={16} />
              </Button>
            </div>
          </div>

          <Separator className="dark:bg-slate-800" />
          
          {/* UNITÀ GOMME */}
          <div className="flex items-center justify-between">
             <div className="space-y-0.5">
              <div className="font-medium text-slate-900 dark:text-slate-200">Unità Pressione</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Gomme (Bar / Psi)</div>
            </div>
            <div className="w-24">
              {loadingConfig ? (
                <div className="h-9 w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-md" />
              ) : (
                <Select value={pressureUnit} onValueChange={handleUnitChange}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Unit" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">Bar</SelectItem>
                    <SelectItem value="psi">Psi</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <Separator className="dark:bg-slate-800" />

          {/* CONFIG AVANZATA */}
          <Link href="/settings/parameters">
            <Button variant="outline" className="w-full justify-start h-10 text-sm gap-2 border-slate-200 dark:border-slate-700">
              <Sliders size={16} /> Configurazione Campi Avanzata
            </Button>
          </Link>

        </CardContent>
      </Card>

      {/* 3. INFO LEGALI */}
      <Card className="dark:bg-slate-900 dark:border-slate-800">
          <CardHeader>
            <CardTitle>Supporto</CardTitle>
            <CardDescription>Risorse utili per utilizzare l'app</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <Link href="/guide" className="block">
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded-md">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">Manuale Utente</div>
                    <div className="text-xs text-slate-500">Scopri tutte le funzionalità</div>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-300" />
              </div>
            </Link>

            {/* Qui potresti aggiungere in futuro "Privacy Policy" o "Termini" */}

          </CardContent>
        </Card>

      {/* 4. LOGOUT & FOOTER */}
      <div className="pt-2 pb-10">
        <Button 
          variant="destructive" 
          onClick={() => signout()} 
          className="w-full bg-red-600 hover:bg-red-700 text-white gap-2 h-12 text-base shadow-sm rounded-xl"
        >
          <LogOut size={18} /> Disconnetti
        </Button>
        
        <div className="mt-8 text-center space-y-2">
          
          {user?.id && (
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-mono bg-slate-100 dark:bg-slate-900 py-1 px-2 rounded-full inline-flex mx-auto max-w-[80%]">
              <Fingerprint size={10} />
              <span className="truncate">ID: {user.id}</span>
            </div>
          )}

          <p className="text-xs text-slate-500 font-medium">
            SagManager v{packageInfo.version}
          </p>
          
          <Link 
            href="https://github.com/marcocipriani/sag-manager" 
            target="_blank"
            className="flex justify-center items-center gap-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <Github size={14} />
            <span className="text-xs">Open Source Project</span>
          </Link>
        </div>
      </div>

    </PageLayout>
  )
}