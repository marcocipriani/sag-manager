"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { PageLayout } from "@/components/layout/page-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Calendar, MapPin, Bike, ChevronRight, Timer, Loader2 
} from "lucide-react"

// Tipi per i dati che riceviamo da Supabase
type Session = {
  id: string
  name: string
  session_number: number
  created_at: string
}

type TrackDay = {
  id: string
  date: string
  circuit_name: string
  bike: {
    brand: string
    model: string
  }
  sessions: Session[]
}

export default function HistoryPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState<TrackDay[]>([])

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // Scarica Giornate + Info Moto + Sessioni collegate
        const { data, error } = await supabase
          .from('track_days')
          .select(`
            id,
            date,
            circuit_name,
            bike:bikes ( brand, model ),
            sessions ( id, name, session_number, created_at )
          `)
          .order('date', { ascending: false }) // Prima le giornate più recenti
          
        if (error) throw error

        if (data) {
          // Ordina le sessioni interne per numero (1, 2, 3...)
          const sortedData = data.map((day: any) => ({
            ...day,
            sessions: day.sessions.sort((a: Session, b: Session) => a.session_number - b.session_number)
          }))
          setHistory(sortedData)
        }
      } catch (err) {
        console.error("Errore caricamento storico:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [])

  if (loading) {
    return (
      <PageLayout title="Storico">
        <div className="flex justify-center pt-20">
          <Loader2 className="animate-spin text-green-600" size={40} />
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Storico Giornate">
      
      {history.length === 0 ? (
        <div className="text-center py-10 text-slate-500">
          <p>Non hai ancora registrato nessuna giornata.</p>
          <Link href="/new-session" className="text-green-600 font-bold mt-2 inline-block">
            Inizia la prima sessione
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {history.map((day) => (
            <div key={day.id} className="space-y-2">
              
              {/* Intestazione Giornata (Data e Circuito) */}
              <div className="flex items-center gap-2 px-1">
                <div className="bg-slate-900 dark:bg-green-900/30 text-white dark:text-green-400 p-2 rounded-lg">
                  <Calendar size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-none dark:text-white">
                    {new Date(day.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <MapPin size={12} /> {day.circuit_name} 
                    <span className="mx-1">•</span> 
                    <Bike size={12} /> {day.bike?.brand} {day.bike?.model}
                  </div>
                </div>
              </div>

              {/* Lista Sessioni della Giornata */}
              <div className="grid gap-2">
                {day.sessions.map((session) => (
                  <Link href={`/history/${session.id}`} key={session.id}>
                    <Card className="hover:border-green-500 dark:hover:border-green-500 transition-all cursor-pointer border-slate-200 dark:border-slate-800 dark:bg-slate-900 shadow-sm group">
                      <CardContent className="p-4 flex items-center justify-between">
                        
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700">
                            {session.session_number}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                              {session.name}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-slate-400">
                              <Timer size={12} />
                              {new Date(session.created_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>

                        <ChevronRight className="text-slate-300 group-hover:text-green-500 transition-colors" size={20} />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

            </div>
          ))}
        </div>
      )}
    </PageLayout>
  )
}