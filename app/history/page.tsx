import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { HistoryList } from "./history-list"
import { Loader2 } from "lucide-react"

async function HistoryContent() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: rawSessions, error } = await supabase
    .from('sessions')
    .select(`
      id, name, created_at, best_lap,
      track_days!inner (
        id, date, circuit_name,
        bike:bikes!inner ( id, brand, model, color, user_id )
      )
    `)
    .eq('track_days.bike.user_id', user?.id)
    .order('created_at', { ascending: false })

  if (error || !rawSessions) return <div className="text-red-500 text-center p-4">Errore caricamento dati.</div>

  const bestByCircuit: Record<string, string> = {}
  const bestByDay: Record<string, string> = {}
  const bestByBike: Record<string, string> = {}

  const isFaster = (current: string | null, best: string | undefined) => {
    if (!current) return false
    if (!best) return true
    return current < best
  }

  rawSessions.forEach(s => {
    const lap = s.best_lap
    if (!lap) return

    const circuit = s.track_days.circuit_name
    const dayId = s.track_days.id
    const bikeId = s.track_days.bike.id

    if (isFaster(lap, bestByCircuit[circuit])) bestByCircuit[circuit] = lap
    if (isFaster(lap, bestByDay[dayId])) bestByDay[dayId] = lap
    if (isFaster(lap, bestByBike[bikeId])) bestByBike[bikeId] = lap
  })

  const sessions = rawSessions.map(s => ({
    ...s,
    isBestCircuit: s.best_lap && s.best_lap === bestByCircuit[s.track_days.circuit_name],
    isBestDay: s.best_lap && s.best_lap === bestByDay[s.track_days.id],
    isBestBike: s.best_lap && s.best_lap === bestByBike[s.track_days.bike.id]
  }))

  return <HistoryList initialSessions={sessions as any} />
}

export default function HistoryPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-green-600 mb-2" />
        <p className="text-sm">Analisi tempi...</p>
      </div>
    }>
      <HistoryContent />
    </Suspense>
  )
}