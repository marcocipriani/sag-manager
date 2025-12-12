"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { addSessionToPDF } from "@/lib/pdf-utils"
import { PageLayout } from "@/components/layout/page-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { 
  Calendar, MapPin, Bike, ChevronRight, Timer, Loader2, Printer 
} from "lucide-react"
import jsPDF from "jspdf"

type SessionSummary = { id: string, name: string, session_number: number, created_at: string }
type TrackDay = {
  id: string, date: string, circuit_name: string,
  bike: { brand: string, model: string },
  sessions: SessionSummary[]
}

export default function HistoryPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState<TrackDay[]>([])
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data, error } = await supabase
          .from('track_days')
          .select(`
            id, date, circuit_name,
            bike:bikes ( brand, model ),
            sessions ( id, name, session_number, created_at )
          `)
          .order('date', { ascending: false })
          
        if (error) throw error
        if (data) {
          const sortedData = data.map((day: any) => ({
            ...day,
            sessions: day.sessions.sort((a: any, b: any) => a.session_number - b.session_number)
          }))
          setHistory(sortedData)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [])

  const handlePrintDay = async (dayId: string, dateStr: string) => {
    setDownloadingId(dayId)
    try {
      // 1. Scarichiamo TUTTI i dati
      const { data: fullSessions, error } = await supabase
        .from('sessions')
        .select(`*, track_days ( date, circuit_name, rider_weight, bike:bikes(brand, model) )`)
        .eq('track_day_id', dayId)
        .order('session_number', { ascending: true })

      if (error || !fullSessions) throw new Error("Errore download dati")

      if (fullSessions.length === 0) {
        toast.warning("Nessuna sessione da stampare")
        return
      }

      // 2. Generiamo il PDF
      const doc = new jsPDF()
      
      fullSessions.forEach((session, index) => {
        if (index > 0) doc.addPage();
        addSessionToPDF(doc, session);
      })

      // --- NUOVA LOGICA NOME FILE ---
      // dateStr dal DB è già YYYY-MM-DD
      const fileName = `SagManager-${dateStr}.pdf`;

      doc.save(fileName)
      toast.success("Report giornaliero scaricato", { description: fileName })

    } catch (err) {
      toast.error("Errore generazione PDF")
      console.error(err)
    } finally {
      setDownloadingId(null)
    }
  }

  if (loading) return <PageLayout title="Storico"><div className="pt-20 flex justify-center"><Loader2 className="animate-spin" /></div></PageLayout>

  return (
    <PageLayout title="Storico Giornate">
      {history.length === 0 ? (
        <div className="text-center py-10 text-slate-500">
          <p>Nessuna giornata registrata.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {history.map((day) => (
            <div key={day.id} className="space-y-3">
              
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-900 dark:bg-green-900/30 text-white dark:text-green-400 p-2.5 rounded-xl shadow-sm">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-none dark:text-white capitalize">
                      {new Date(day.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <MapPin size={12} /> {day.circuit_name} 
                      <span className="mx-1">•</span> 
                      <Bike size={12} /> {day.bike?.brand} {day.bike?.model}
                    </div>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  size="icon" 
                  disabled={downloadingId === day.id}
                  onClick={() => handlePrintDay(day.id, day.date)}
                  className="rounded-full border-slate-200 dark:border-slate-700 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400"
                  title="Stampa Report Giornata"
                >
                  {downloadingId === day.id ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}
                </Button>
              </div>

              <div className="grid gap-2 pl-2 border-l-2 border-slate-100 dark:border-slate-800 ml-5">
                {day.sessions.map((session) => (
                  <Link href={`/history/${session.id}`} key={session.id} className="block group pl-4 relative">
                     <div className="absolute -left-[21px] top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-slate-200 dark:bg-slate-700 group-hover:bg-green-500 transition-colors border-2 border-slate-50 dark:border-slate-950" />
                    
                    <Card className="hover:border-green-500 dark:hover:border-green-500 transition-all cursor-pointer border-slate-200 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                      <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-xs border border-slate-200 dark:border-slate-700">
                            #{session.session_number}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                              {session.name}
                            </p>
                            <div className="flex items-center gap-1 text-[10px] text-slate-400">
                              <Timer size={10} />
                              {new Date(session.created_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="text-slate-300 group-hover:text-green-500 transition-colors" size={16} />
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