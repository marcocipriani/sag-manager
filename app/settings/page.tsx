// src/app/settings/page.tsx
"use client"

import { PageLayout } from "@/components/layout/page-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { 
  User, 
  LogOut, 
  Moon, 
  Sun, 
  FileText, 
  Shield, 
  Github 
} from "lucide-react"
import { useTheme } from "next-themes"
// 1. IMPORTIAMO L'AZIONE
import { signout } from "@/app/login/actions" 

export default function SettingsPage() {
  const { setTheme, theme } = useTheme()

  return (
    <PageLayout title="Impostazioni">
      
      {/* ... (SEZIONI PROFILO E PREFERENZE RIMANGONO IDENTICHE) ... */}
      <Card className="dark:bg-slate-900 dark:border-slate-800">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center border-2 border-slate-200 dark:border-slate-700">
              <User size={32} className="text-slate-500 dark:text-slate-400" />
            </div>
            <div>
              <CardTitle className="text-xl dark:text-white">Utente</CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                Profilo Pilota
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Pulsante Placeholder (non fa nulla per ora) */}
          <Button variant="outline" className="w-full justify-start gap-2 dark:border-slate-700 dark:text-slate-200">
            <User size={16} /> Modifica Profilo
          </Button>
        </CardContent>
      </Card>

      <Card className="dark:bg-slate-900 dark:border-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg dark:text-white">Preferenze App</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-medium text-slate-900 dark:text-slate-200">Tema</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Seleziona l'aspetto dell'app
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant={theme === 'light' ? 'default' : 'outline'} 
                size="icon"
                onClick={() => setTheme('light')}
                className={theme === 'light' ? 'bg-slate-900' : ''}
              >
                <Sun size={18} />
              </Button>
              <Button 
                variant={theme === 'dark' ? 'default' : 'outline'} 
                size="icon"
                onClick={() => setTheme('dark')}
                className={theme === 'dark' ? 'bg-green-600 hover:bg-green-700 border-transparent text-white' : ''}
              >
                <Moon size={18} />
              </Button>
            </div>
          </div>
          <Separator className="dark:bg-slate-800" />
          <div className="flex items-center justify-between">
             <div className="space-y-0.5">
              <div className="font-medium text-slate-900 dark:text-slate-200">Unità di Misura</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Pressione gomme (Bar)
              </div>
            </div>
             <Button variant="ghost" disabled className="text-slate-400">Bar</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="dark:bg-slate-900 dark:border-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg dark:text-white">Dati e Privacy</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          <Button variant="outline" className="w-full justify-start gap-2 dark:border-slate-700 dark:text-slate-200">
            <FileText size={16} /> Esporta tutti i dati (PDF)
          </Button>
          <Button variant="outline" className="w-full justify-start gap-2 dark:border-slate-700 dark:text-slate-200">
            <Shield size={16} /> Privacy Policy
          </Button>
        </CardContent>
      </Card>

      {/* SECTION 4: SYSTEM / LOGOUT */}
      <div className="pt-4 pb-8">
        {/* 2. COLLEGHIAMO L'AZIONE AL BOTTONE */}
        <Button 
          variant="destructive" 
          onClick={() => signout()} 
          className="w-full bg-red-600 hover:bg-red-700 text-white gap-2 h-12 text-base shadow-sm"
        >
          <LogOut size={18} /> Logout
        </Button>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400">SagManager v1.0.0</p>
          <div className="flex justify-center gap-2 mt-2 text-slate-400">
            <Github size={14} />
            <span className="text-xs">Open Source Project</span>
          </div>
        </div>
      </div>

    </PageLayout>
  )
}