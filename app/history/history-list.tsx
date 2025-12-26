"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  Search, Calendar, MapPin, ArrowUpDown, Bike, ChevronRight, 
  ArrowLeftRight, CheckCircle2, Circle, X, Crown, Star, Trophy, Clock
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select, SelectContent, SelectItem, SelectTrigger,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { PageLayout } from "@/components/layout/page-layout"
import { usePreferences } from "@/components/preferences-provider"
import { CompareSheet } from "./compare-sheet"

type SessionItem = {
  id: string
  name: string
  created_at: string
  best_lap: string | null
  isBestCircuit?: boolean
  isBestDay?: boolean
  isBestBike?: boolean
  track_days: {
    id: string
    date: string
    circuit_name: string
    bike: {
      brand: string
      model: string
      color: string 
    } | null
  } | null
  [key: string]: any 
}

interface HistoryListProps {
  initialSessions: SessionItem[]
}

export function HistoryList({ initialSessions }: HistoryListProps) {
  const router = useRouter()
  const { timeFormat } = usePreferences() 
  
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCircuit, setFilterCircuit] = useState("all")
  const [filterBike, setFilterBike] = useState("all")
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc")
  
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isCompareOpen, setIsCompareOpen] = useState(false)

  const formatSessionTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('it-IT', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: timeFormat === '12h' 
    })
  }

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id)
      if (prev.length >= 2) return [prev[1], id]
      return [...prev, id]
    })
  }

  const handleCompare = () => {
    if (selectedIds.length === 2) {
      setIsCompareOpen(true)
    }
  }

  const sessionA = initialSessions.find(s => s.id === selectedIds[0])
  const sessionB = initialSessions.find(s => s.id === selectedIds[1])

  const headerAction = isSelectionMode ? (
    <div className="flex gap-2 animate-in fade-in slide-in-from-right-2">
       <Button variant="ghost" size="sm" onClick={() => { setIsSelectionMode(false); setSelectedIds([]) }} className="text-slate-400 hover:text-white">
         Annulla
       </Button>
       <Button 
         size="sm" 
         className="bg-green-600 hover:bg-green-700 text-white font-bold transition-all"
         disabled={selectedIds.length !== 2}
         onClick={handleCompare}
       >
         Confronta ({selectedIds.length}/2)
       </Button>
    </div>
  ) : (
    <Button 
      variant="ghost" 
      size="sm"
      className="text-slate-400 hover:text-white hover:bg-slate-800 gap-2"
      onClick={() => setIsSelectionMode(true)}
    >
      <ArrowLeftRight size={18} />
      <span className="hidden xs:inline">Confronta</span>
    </Button>
  )

  const uniqueCircuits = useMemo(() => {
    const items = initialSessions.map(s => s.track_days?.circuit_name).filter(Boolean) as string[]
    return Array.from(new Set(items)).sort()
  }, [initialSessions])

  const uniqueBikes = useMemo(() => {
    const items = initialSessions.map(s => {
        if (!s.track_days?.bike) return null
        return `${s.track_days.bike.brand} ${s.track_days.bike.model}`
    }).filter(Boolean) as string[]
    return Array.from(new Set(items)).sort()
  }, [initialSessions])

  const filteredSessions = useMemo(() => {
    return initialSessions
      .filter((session) => {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch = 
          session.name.toLowerCase().includes(searchLower) ||
          session.track_days?.circuit_name.toLowerCase().includes(searchLower) ||
          session.track_days?.bike?.model.toLowerCase().includes(searchLower)
        
        const matchesCircuit = filterCircuit === "all" || session.track_days?.circuit_name === filterCircuit
        const bikeName = session.track_days?.bike ? `${session.track_days.bike.brand} ${session.track_days.bike.model}` : "N/D"
        const matchesBike = filterBike === "all" || bikeName === filterBike

        return matchesSearch && matchesCircuit && matchesBike
      })
      .sort((a, b) => {
        const dateA = new Date(a.created_at).getTime()
        const dateB = new Date(b.created_at).getTime()
        return sortOrder === "desc" ? dateB - dateA : dateA - dateB
      })
  }, [initialSessions, searchTerm, filterCircuit, filterBike, sortOrder])

  const groupedSessions = useMemo(() => {
    const groups: Record<string, SessionItem[]> = {}
    filteredSessions.forEach(session => {
      const date = session.track_days?.date || "Sconosciuto"
      const circuit = session.track_days?.circuit_name || "Sconosciuto"
      const key = `${date}::${circuit}`
      if (!groups[key]) groups[key] = []
      groups[key].push(session)
    })
    return Object.entries(groups)
  }, [filteredSessions])

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })
  }

  const hasActiveFilters = searchTerm !== "" || filterCircuit !== "all" || filterBike !== "all"
  const clearFilters = () => { setSearchTerm(""); setFilterCircuit("all"); setFilterBike("all") }

  return (
    <PageLayout title="Storico Sessioni" showBackButton={true} rightAction={headerAction}>
      
      <div className="space-y-6 pb-20 relative">
        
        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 sticky top-20 z-30 mx-1 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 supports-[backdrop-filter]:bg-white/60">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Cerca turno, circuito, moto..." 
              className="pl-9 h-9 text-sm bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {hasActiveFilters && (
              <Button variant="destructive" size="icon" className="h-9 w-9 shrink-0 rounded-lg opacity-90 hover:opacity-100" onClick={clearFilters}><X size={16} /></Button>
            )}
            <Select value={filterCircuit} onValueChange={setFilterCircuit}>
              <SelectTrigger className="h-9 text-xs bg-white dark:bg-slate-950 min-w-[110px] max-w-[140px]">
                <div className="flex items-center gap-2 text-slate-500 truncate w-full"><MapPin size={14} className="shrink-0" /><span className="truncate block">{filterCircuit === 'all' ? 'Tutti' : filterCircuit}</span></div>
              </SelectTrigger>
              <SelectContent><SelectItem value="all">Tutti i Circuiti</SelectItem>{uniqueCircuits.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={filterBike} onValueChange={setFilterBike}>
              <SelectTrigger className="h-9 text-xs bg-white dark:bg-slate-950 min-w-[110px] max-w-[140px]">
                <div className="flex items-center gap-2 text-slate-500 truncate w-full"><Bike size={14} className="shrink-0" /><span className="truncate block">{filterBike === 'all' ? 'Tutte' : filterBike}</span></div>
              </SelectTrigger>
              <SelectContent><SelectItem value="all">Tutte le Moto</SelectItem>{uniqueBikes.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
            </Select>
            <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 ml-auto border border-slate-200 dark:border-slate-800" onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}><ArrowUpDown size={14} className="text-slate-500"/></Button>
          </div>
        </div>

        <div className="space-y-8">
          {groupedSessions.length === 0 ? (
            <div className="text-center py-10 text-slate-500">Nessuna sessione trovata.</div>
          ) : (
            groupedSessions.map(([groupKey, sessions]) => {
              const [dateStr, circuitName] = groupKey.split("::")
              return (
                <div key={groupKey} className="relative">
                  
                  <div className="sticky top-[148px] z-20 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-sm py-2 px-1 mb-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-200 dark:bg-slate-800 p-2 rounded-lg"><Calendar size={20} className="text-slate-600 dark:text-slate-400" /></div>
                      <div>
                        <h3 className="font-bold text-slate-800 dark:text-white capitalize text-sm sm:text-base">{formatDate(dateStr)}</h3>
                        <div className="flex items-center gap-1 text-xs text-slate-500"><MapPin size={12} /> {circuitName}</div>
                      </div>
                    </div>
                    {sessions.some(s => s.isBestDay) && <Badge variant="secondary" className="hidden xs:flex bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] gap-1 border-none"><Star size={10} fill="currentColor" /> Best Day</Badge>}
                  </div>

                  <div className="grid grid-cols-1 gap-3 pl-2 sm:pl-4 border-l-2 border-slate-200 dark:border-slate-800 ml-2 sm:ml-4">
                    {sessions.map((session) => (
                      <div key={session.id} className="relative flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                        {isSelectionMode && (
                          <button onClick={() => toggleSelection(session.id)} className="shrink-0 transition-transform active:scale-90">
                             {selectedIds.includes(session.id) ? <CheckCircle2 className="text-green-600 h-6 w-6" /> : <Circle className="text-slate-300 h-6 w-6" />}
                          </button>
                        )}
                        <Link 
                          href={isSelectionMode ? "#" : `/history/${session.id}`} 
                          className={cn("block flex-1 group", isSelectionMode && "cursor-pointer")}
                          onClick={(e) => { if(isSelectionMode) { e.preventDefault(); toggleSelection(session.id) } }}
                        >
                          <Card className={cn("transition-all dark:bg-slate-900 dark:border-slate-800 relative overflow-hidden", isSelectionMode && selectedIds.includes(session.id) ? "ring-2 ring-green-500 border-transparent bg-green-50 dark:bg-green-900/10" : "hover:border-green-500 hover:shadow-md")}>
                            {session.isBestCircuit && <div className="absolute right-0 top-0 p-1.5 bg-yellow-400 text-yellow-900 rounded-bl-xl z-10 shadow-sm"><Crown size={14} fill="currentColor" /></div>}
                            
                            <CardContent className="p-3 sm:p-4 flex items-center justify-between">
                              <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                                 
                                 <div className="flex flex-col items-center justify-center w-14 shrink-0 border-r border-slate-100 dark:border-slate-800 pr-3 mr-1 gap-1">
                                    <Clock size={14} className="text-slate-400" />
                                    <div className="text-center">
                                      <span className="text-sm font-bold font-mono text-slate-900 dark:text-white block leading-none">
                                        {formatSessionTime(session.created_at)}
                                      </span>
                                      {timeFormat === '12h' && (
                                         <span className="text-[10px] text-slate-400 font-bold mt-0.5 block">
                                            {new Date(session.created_at).toLocaleTimeString('en-US', {hour12:true}).slice(-2)}
                                         </span>
                                      )}
                                    </div>
                                 </div>

                                 <div className="min-w-0 flex-1">
                                   <h4 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-green-600 transition-colors truncate text-sm sm:text-base">{session.name}</h4>
                                   <div className="flex flex-wrap items-center gap-2 mt-1">
                                     {session.track_days?.bike && (
                                       <span className="text-[10px] text-slate-500 flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-700 max-w-full">
                                          <div className={`w-1.5 h-1.5 rounded-full ${session.track_days.bike.color || 'bg-slate-400'} shrink-0`} /> 
                                          <span className="truncate">{session.track_days.bike.brand} {session.track_days.bike.model}</span>
                                       </span>
                                     )}
                                     
                                     {session.isBestBike && <span className="text-[9px] font-bold text-blue-500 flex items-center gap-0.5 bg-blue-50 dark:bg-blue-900/20 px-1 rounded"><Trophy size={10}/> Moto</span>}
                                     {session.isBestDay && <span className="text-[9px] font-bold text-amber-500 flex items-center gap-0.5 bg-amber-50 dark:bg-amber-900/20 px-1 rounded"><Star size={10}/> Day</span>}
                                   </div>
                                 </div>
                              </div>
                              <div className="text-right shrink-0 pl-2">
                                 {session.best_lap ? <div className={cn("font-mono font-bold text-base sm:text-lg", session.isBestCircuit ? "text-yellow-600 dark:text-yellow-400" : "text-slate-900 dark:text-white")}>{session.best_lap}</div> : <span className="text-xs text-slate-400 italic">No time</span>}
                                 {!isSelectionMode && <ChevronRight className="ml-auto mt-1 text-slate-300 group-hover:text-green-500 transition-colors" size={16} />}
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      </div>
                    ))}
                  </div>

                </div>
              )
            })
          )}
        </div>
      </div>

      <CompareSheet 
        isOpen={isCompareOpen} 
        onClose={() => setIsCompareOpen(false)} 
        sessionA={sessionA} 
        sessionB={sessionB} 
      />

    </PageLayout>
  )
}