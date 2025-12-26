import Link from "next/link"
import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { PageLayout } from "@/components/layout/page-layout"
import { BikeWidget } from "@/components/home/bike-widget"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Bike, Plus, History, Map, User, ChevronRight, Calendar, MapPin, Loader2, Clock, Settings } from "lucide-react"

async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const [bikesResult, sessionsResult, profileResult] = await Promise.all([
    supabase
      .from('bikes')
      .select('*')
      .eq('user_id', user.id)
      .order('is_active', { ascending: false })
      .order('created_at', { ascending: false }),
    
    supabase
      .from('sessions')
      .select(`
        id, name, created_at, session_number,
        track_days!inner ( circuit_name, date, bike:bikes!inner ( brand, model ) )
      `)
      .order('created_at', { ascending: false })
      .limit(5),

    supabase
      .from('profiles')
      .select('full_name, time_format')
      .eq('id', user.id)
      .single()
  ])

  const bikes = bikesResult.data || []
  const recentSessions = sessionsResult.data || []
  const profile = profileResult.data
  
  const displayName = profile?.full_name 
    ? profile.full_name.split(' ')[0] 
    : user.email?.split('@')[0] || "Pilota"

  const use24h = profile?.time_format !== '12h'

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })
  }
  
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('it-IT', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: !use24h 
    })
  }

  const customTitle = (
    <div className="flex flex-col leading-none">
      <span className="text-sm font-normal text-slate-500">Bentornato,</span>
      <span className="font-bold text-slate-900 dark:text-white">{displayName}</span>
    </div>
  )

  const headerAction = (
    <Link href="/settings">
      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
        <User size={20} />
      </Button>
    </Link>
  )

  return (
    <PageLayout title={customTitle} isHomePage rightAction={headerAction} className="max-w-lg">
      <div className="space-y-6 pb-20">
        
        {/* NUOVA SESSIONE */}
        <section>
          <Link href="/new-session">
            <Button className="w-full h-16 text-lg font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20 gap-2 rounded-2xl transition-all active:scale-[0.98]">
              <Plus size={24} strokeWidth={3} /> Nuova Sessione
            </Button>
          </Link>
        </section>

        {/* MOTO ATTIVA */}
        <section>
          <BikeWidget bikes={bikes} />
        </section>

        {/* ATTIVITÀ RECENTI */}
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-base">
              <History size={18} className="text-green-600" /> Attività recenti
            </h3>
            {recentSessions.length > 0 && (
              <Link href="/history" className="text-xs text-slate-500 font-medium flex items-center hover:text-green-600 transition-colors">
                Tutte le attività <ChevronRight size={12} />
              </Link>
            )}
          </div>
          
          <Card className="border-slate-200 dark:border-slate-800 dark:bg-slate-900/50 shadow-sm overflow-hidden rounded-xl">
            <CardContent className="p-0">
              {recentSessions.length === 0 ? (
                <div className="p-8 text-center text-slate-500 border-dashed border-2 border-slate-100 dark:border-slate-800 m-2 rounded-lg">
                  <p className="text-sm font-medium">Nessuna sessione</p>
                  <p className="text-xs mt-1 opacity-70">Registra il tuo primo ingresso in pista!</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recentSessions.map((session: any) => (
                    <Link 
                      key={session.id} 
                      href={`/history/${session.id}`}
                      className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group relative"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center text-slate-600 dark:text-slate-400 font-bold border border-slate-200 dark:border-slate-700">
                          <span className="text-[10px] uppercase font-normal text-slate-400 leading-none mb-0.5">Turno</span>
                          <span className="text-sm leading-none">{session.session_number}</span>
                        </div>
                        
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors truncate">
                            {session.name}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                            <span className="flex items-center gap-1 min-w-0 truncate">
                              <MapPin size={10} /> 
                              <span className="truncate">{session.track_days?.circuit_name}</span>
                            </span>
                            <span className="w-0.5 h-0.5 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0" />
                            <span className="flex items-center gap-1 whitespace-nowrap">
                              <Calendar size={10} /> {formatDate(session.track_days.date)}
                            </span>
                            <span className="flex items-center gap-1 whitespace-nowrap">
                              <Clock size={10} /> {formatTime(session.created_at)}
                              {!use24h && <span className="text-[9px] uppercase font-bold opacity-70">{new Date(session.created_at).toLocaleTimeString('en-US', {hour12:true}).slice(-2)}</span>}
                            </span>
                            {session.track_days?.bike && (
                              <>
                                <span className="w-0.5 h-0.5 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0" />
                                <span className="flex items-center gap-1 min-w-0 truncate max-w-[80px] xs:max-w-full text-slate-600 dark:text-slate-300 font-medium">
                                  <Bike size={10} /> 
                                  <span className="truncate">{session.track_days.bike.brand} {session.track_days.bike.model}</span>
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <ChevronRight size={16} className="text-slate-300 dark:text-slate-700 group-hover:text-green-500 transition-colors ml-2 shrink-0" />
                    </Link>
                  ))}
                  <Link href="/history">
                    <div className="p-3 text-center text-xs font-medium text-slate-400 hover:text-green-600 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer">
                      Visualizza tutte le attività
                    </div>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* CIRCUITI */}
        <section>
          <Link href="/tracks">
            <Button variant="outline" className="w-full h-12 border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 gap-2 rounded-xl">
              <Map size={18} /> Gestione circuiti
            </Button>
          </Link>
        </section>
      </div>
    </PageLayout>
  )
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 dark:bg-slate-950 text-slate-400">
        <Loader2 className="h-10 w-10 animate-spin text-green-600 mb-2" />
        <p className="text-sm font-medium">Caricamento Dashboard...</p>
      </div>
    }>
      <Dashboard />
    </Suspense>
  )
}