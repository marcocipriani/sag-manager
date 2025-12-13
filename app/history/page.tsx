"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { PageLayout } from "@/components/layout/page-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox" 
import { CompareSheet } from "./compare-sheet"
import Link from "next/link"
import { 
  Calendar, MapPin, ChevronRight, Search, Bike, ArrowLeftRight, Loader2, FilterX 
} from "lucide-react"

export default function HistoryPage() {
  const supabase = createClient()
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // STATI PER LA COMPARAZIONE
  const [isCompareMode, setIsCompareMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  useEffect(() => {
    const fetchHistory = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('sessions')
          .select(`
             *,
             track_days!inner ( circuit_name, date, bike:bikes (brand, model) )
          `)
          .order('created_at', { ascending: false })
        
        if (data) setSessions(data)
      }
      setLoading(false)
    }
    fetchHistory()
  }, [])

  // Gestione selezione checkbox
  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id)
      if (prev.length >= 2) return [prev[1], id] // Mantieni sempre max 2, rimuovi il primo
      return [...prev, id]
    })
  }

  // Tasto Header
  const headerAction = (
    <Button 
      size="sm" 
      variant={isCompareMode ? "secondary" : "ghost"}
      onClick={() => {
        setIsCompareMode(!isCompareMode)
        setSelectedIds([]) // Reset quando esci
      }}
      className={isCompareMode ? "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white" : "text-slate-500"}
    >
      {isCompareMode ? <FilterX size={18} /> : <ArrowLeftRight size={18} />}
      <span className="ml-2 text-xs">{isCompareMode ? "Annulla" : "Confronta"}</span>
    </Button>
  )

  if (loading) return <PageLayout title="Storico"><div className="pt-20 flex justify-center"><Loader2 className="animate-spin text-green-600"/></div></PageLayout>

  return (
    <PageLayout title="Storico Sessioni" rightAction={headerAction} showBackButton>
      
      {/* FLOATING ACTION BUTTON PER APRIRE IL CONFRONTO */}
      {isCompareMode && selectedIds.length === 2 && (
        <div className="fixed bottom-6 left-0 right-0 px-4 z-50 flex justify-center animate-in slide-in-from-bottom-4">
          <Button 
            onClick={() => setIsSheetOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white shadow-xl rounded-full h-12 px-8 text-base font-bold gap-2"
          >
            <ArrowLeftRight size={18} /> Confronta 2 Sessioni
          </Button>
        </div>
      )}

      <div className="space-y-3 pb-24">
        {sessions.length === 0 ? (
          <div className="text-center py-10 text-slate-400">Nessuna sessione trovata</div>
        ) : (
          sessions.map((session) => (
            <div key={session.id} className="flex items-center gap-3">
              
              {/* CHECKBOX (Visibile solo in Compare Mode) */}
              {isCompareMode && (
                <div className="animate-in fade-in zoom-in duration-200">
                  <Checkbox 
                    checked={selectedIds.includes(session.id)}
                    onCheckedChange={() => toggleSelection(session.id)}
                    className="h-6 w-6 border-slate-300 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                  />
                </div>
              )}

              {/* CARD SESSIONE */}
              <Link 
                href={isCompareMode ? "#" : `/history/${session.id}`} 
                onClick={(e) => isCompareMode && e.preventDefault()} // Disabilita link in compare mode
                className={`flex-1 block transition-all ${isCompareMode && selectedIds.includes(session.id) ? 'opacity-100' : isCompareMode ? 'opacity-60' : 'opacity-100'}`}
              >
                <Card className={`border-slate-200 dark:border-slate-800 dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${isCompareMode && selectedIds.includes(session.id) ? 'ring-2 ring-green-500 border-transparent' : ''}`}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900 dark:text-white text-base">
                          {session.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-slate-500">
                          #{session.session_number}
                        </span>
                      </div>
                      
                      <div className="flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                          <MapPin size={12} className="text-green-600" />
                          {session.track_days?.circuit_name}
                        </div>
                        <div className="flex items-center gap-2">
                           <Calendar size={12} />
                           {new Date(session.created_at).toLocaleDateString('it-IT')}
                           <span className="text-slate-300 dark:text-slate-700">•</span>
                           <Bike size={12} />
                           {session.track_days?.bike?.model}
                        </div>
                      </div>
                    </div>
                    
                    {!isCompareMode && <ChevronRight size={18} className="text-slate-300" />}
                  </CardContent>
                </Card>
              </Link>
            </div>
          ))
        )}
      </div>

      <CompareSheet 
        isOpen={isSheetOpen} 
        onClose={() => setIsSheetOpen(false)} 
        sessionA={sessions.find(s => s.id === selectedIds[0])}
        sessionB={sessions.find(s => s.id === selectedIds[1])}
      />

    </PageLayout>
  )
}