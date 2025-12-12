import Link from "next/link"
import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { PageLayout } from "@/components/layout/page-layout"
import { BikeWidget } from "@/components/home/bike-widget"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Plus, History, ChevronRight, Map, User, Calendar, MapPin, Loader2, Timer 
} from "lucide-react"

// 1. Componente Principale
async function Dashboard() {
  const supabase = await createClient()
  
  // A. Recupera Utente (per il titolo e i dati)
  const { data: { user } } = await supabase.auth.getUser()
  
  // B. Costruiamo il Titolo Personalizzato
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Pilota"
  
  const customTitle = (
    <span>
      Dashboard <span className="text-slate-400 dark:text-slate-500 font-normal ml-0.5">di {displayName}</span>
    </span>
  )

  const headerAction = (
    <Link href="/settings">
      <Button variant="ghost" size="icon" className="text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
        <User size={22} />
      </Button>
    </Link>
  )

  // C. Recupera le Moto
  let bikes = null
  if (user) {
    const { data } = await supabase
      .from('bikes')
      .select('*')
      .eq('user_id', user.id)
      .order('is_active', { ascending: false })
      .order('created_at', { ascending: false })
    bikes = data
  }

  // D. Recupera le Ultime 5 Sessioni
  let recentSessions: any[] = []
  if (user) {
    const { data } = await supabase
      .from('sessions')
      .select(`
        id, name, created_at, session_number,
        track_days!inner ( circuit_name, date )
      `)
      .order('created_at', { ascending: false })
      .limit(5)
    
    recentSessions = data || []
  }

  // E. Renderizza la Pagina Completa
  return (
    <PageLayout title={customTitle} isHomePage rightAction={headerAction}>
      <div className="space-y-6 pb-20">
        
        {/* NUOVA SESSIONE */}
        <section>
          <Link href="/new-session">
            <Button className="w-full h-16 text-xl font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20 gap-3 rounded-2xl transition-all active:scale-95">
              <Plus size={28} /> Nuova Sessione
            </Button>
          </Link>
        </section>

        {/* WIDGET MOTO */}
        <section>
          <BikeWidget bikes={bikes} />
        </section>

        {/* ATTIVITÀ RECENTI */}
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <History size={18} className="text-green-600" /> Attività Recenti
            </h3>
            {recentSessions.length > 0 && (
              <Link href="/history" className="text-xs text-green-600 font-medium flex items-center hover:underline">
                Vedi tutto <ChevronRight size={12} />
              </Link>
            )}
          </div>
          
          <Card className="border-slate-200 dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
            <CardContent className="p-0">
              {recentSessions.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <p className="text-sm">Non hai ancora registrato sessioni.</p>
                  <p className="text-xs mt-1 opacity-70">Inizia la tua prima misurazione!</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recentSessions.map((session: any) => (
                    <Link 
                      key={session.id} 
                      href={`/history/${session.id}`}
                      className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold text-sm border border-slate-200 dark:border-slate-700">
                          {session.session_number}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                            {session.name}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                            <span className="flex items-center gap-1"><MapPin size={10} /> {session.track_days?.circuit_name}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                            <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(session.created_at).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                            <span className="flex items-center gap-1"><Timer size={10} /> {new Date(session.created_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-green-500 transition-colors" />
                    </Link>
                  ))}
                  <Link href="/history" className="block p-3 text-center text-xs font-medium text-slate-500 hover:text-green-600 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">Apri Storico Completo</Link>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* CIRCUITI */}
        <section>
          <Link href="/tracks">
            <Button variant="outline" className="w-full h-12 border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 gap-2 rounded-xl">
              <Map size={18} /> Gestione Circuiti
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