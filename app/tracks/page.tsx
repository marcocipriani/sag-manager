"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { deleteCircuit, toggleFavoriteCircuit, importFamousCircuits } from "./actions"
import { PageLayout } from "@/components/layout/page-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TrackDialog } from "./track-dialog"
import { 
  Plus, Timer, Settings, MoreVertical, Trash2, Pencil, Ruler, Loader2, Navigation, Star, Flag, Search, CloudSun, CloudDownload 
} from "lucide-react"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import Image from "next/image"

export default function TracksPage() {
  const supabase = createClient()
  const [circuits, setCircuits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false) // Stato per il loading dell'import
  
  const [searchTerm, setSearchTerm] = useState("")

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingCircuit, setEditingCircuit] = useState<any>(null)

  useEffect(() => {
    fetchCircuits()
  }, [])

  const fetchCircuits = async () => {
    try {
      const { data: circuitsData, error: circuitsError } = await supabase
        .from('circuits')
        .select('*')
        .order('is_favorite', { ascending: false })
        .order('name', { ascending: true })
      
      if (circuitsError) throw circuitsError

      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select(`id, track_days!inner ( circuit_name )`)
      
      if (sessionsError) throw sessionsError

      const counts: Record<string, number> = {}
      sessionsData?.forEach((session: any) => {
        const cName = session.track_days?.circuit_name
        if (cName) counts[cName] = (counts[cName] || 0) + 1
      })

      const circuitsWithCounts = circuitsData.map(c => ({
        ...c,
        sessions_count: counts[c.name] || 0
      }))

      setCircuits(circuitsWithCounts)
    } catch (error) {
      console.error("Errore caricamento:", error)
      toast.error("Impossibile caricare i circuiti")
    } finally {
      setLoading(false)
    }
  }

  const handleImportFamous = async () => {
    setImporting(true)
    try {
      const res = await importFamousCircuits()
      if (res?.success) {
        const importedCount = res?.count ?? 0
        if (importedCount > 0) {
          toast.success(`${importedCount} circuiti importati con successo!`)
        } else {
          toast.info("Tutti i circuiti famosi sono già presenti.")
        }
        fetchCircuits()
      } else {
        toast.error("Errore durante l'importazione")
      }
    } catch (e) {
      toast.error("Errore di connessione")
    } finally {
      setImporting(false)
    }
  }

  const filteredCircuits = circuits.filter(circuit => 
    circuit.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    circuit.location?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleToggleFavorite = async (circuit: any) => {
    const newStatus = !circuit.is_favorite
    setCircuits(prev => prev.map(c => c.id === circuit.id ? { ...c, is_favorite: newStatus } : c)
      .sort((a, b) => (Number(b.is_favorite) - Number(a.is_favorite)) || a.name.localeCompare(b.name)))

    const res = await toggleFavoriteCircuit(circuit.id, circuit.is_favorite)
    if (!res.success) {
      toast.error("Errore aggiornamento preferito")
      fetchCircuits()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Eliminare questo circuito?")) return
    const res = await deleteCircuit(id)
    if (res.success) {
      toast.success("Eliminato")
      fetchCircuits()
    } else {
      toast.error("Errore eliminazione")
    }
  }

  const handleEdit = (circuit: any) => {
    setEditingCircuit(circuit)
  }

  const headerAction = (
    <div className="flex items-center gap-2">
      <Button 
        variant="outline"
        size="sm" 
        onClick={handleImportFamous}
        disabled={importing}
        className="gap-2 h-9 px-3 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
        title="Scarica circuiti italiani famosi"
      >
        {importing ? <Loader2 size={16} className="animate-spin" /> : <CloudDownload size={16} />}
        <span className="hidden sm:inline">Importa</span>
      </Button>

      <Button variant="ghost" size="icon" onClick={() => setIsAddOpen(true)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
        <Plus size={20} />
        <span className="hidden xs:inline">Nuovo</span>
      </Button>
    </div>
  )

  if (loading) {
    return (
      <PageLayout title="Gestione Circuiti" showBackButton>
        <div className="pt-20 flex justify-center">
          <Loader2 className="animate-spin text-green-600" />
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Gestione Circuiti" rightAction={headerAction} showBackButton>
      <div className="space-y-4 pb-20">
        
        {/* BARRA DI RICERCA */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Cerca circuito o località..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-green-500"
          />
        </div>

        {/* LISTA FILTRATA */}
        {filteredCircuits.length === 0 ? (
          <div className="text-center py-10 text-slate-500">
            {searchTerm ? (
              <p>Nessun circuito trovato per "{searchTerm}"</p>
            ) : (
              <>
                <p>Nessun circuito salvato.</p>
                <div className="flex justify-center gap-4 mt-4">
                    <Button variant="outline" onClick={handleImportFamous}>Importa Famosi</Button>
                    <Button onClick={() => setIsAddOpen(true)}>Aggiungi Nuovo</Button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCircuits.map((circuit) => (
              <Card 
                key={circuit.id} 
                className={`
                  dark:bg-slate-900 overflow-hidden transition-all duration-300
                  ${circuit.is_favorite 
                    ? 'border-green-500/50 dark:border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]' 
                    : 'dark:border-slate-800'
                  }
                `}
              >
                
                {circuit.map_image_url && (
                  // MODIFICA QUI: bg-white forzato per vedere le mappe nere
                  <div className="w-full h-32 relative bg-white border-b dark:border-slate-800">
                    <Image 
                      src={circuit.map_image_url} 
                      alt={circuit.name} 
                      fill 
                      className="object-contain p-4"
                    />
                    <button 
                      onClick={() => handleToggleFavorite(circuit)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:scale-110 transition-transform shadow-sm backdrop-blur-sm border border-slate-100"
                    >
                      <Star 
                        size={18} 
                        className={circuit.is_favorite ? "text-yellow-400 fill-yellow-400" : "text-slate-400"} 
                      />
                    </button>
                  </div>
                )}

                <CardContent className="p-4 relative">
                  
                  {!circuit.map_image_url && (
                    <button 
                      onClick={() => handleToggleFavorite(circuit)}
                      className="absolute top-4 right-12 p-1 text-slate-400 hover:text-yellow-400 hover:scale-110 transition-all"
                    >
                      <Star 
                        size={20} 
                        className={circuit.is_favorite ? "text-yellow-400 fill-yellow-400" : "text-slate-300"} 
                      />
                    </button>
                  )}

                  <div className="flex justify-between items-start">
                    
                    <div>
                      <h3 className="font-bold text-lg dark:text-white flex items-center gap-2 pr-8">
                        {circuit.name}
                      </h3>
                      
                      <div className="flex flex-col gap-1 mt-1 text-sm text-slate-500 dark:text-slate-400">
                        
                        {circuit.location && (
                          <div className="flex items-center gap-3">
                            <a 
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(circuit.location)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 hover:text-green-600 hover:underline transition-colors"
                              title="Apri Navigatore"
                            >
                              <Navigation size={12} /> {circuit.location}
                            </a>

                            <a 
                              href={`https://www.google.com/search?q=meteo+${encodeURIComponent(circuit.location)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-blue-500 hover:text-blue-600 hover:underline transition-colors"
                              title="Vedi Meteo"
                            >
                              <CloudSun size={12} /> Meteo
                            </a>
                          </div>
                        )}
                        
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full font-bold border ${circuit.sessions_count > 0 ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300' : 'bg-slate-50 dark:bg-slate-900 border-transparent text-slate-400'}`}>
                            <Flag size={10} /> {circuit.sessions_count} Sessioni
                          </span>

                          {circuit.length_meters && (
                            <span className="flex items-center gap-1.5 text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                              <Ruler size={10} /> {circuit.length_meters}m
                            </span>
                          )}
                          
                          {circuit.best_lap && (
                            <span className="flex items-center gap-1.5 text-xs bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 px-2 py-0.5 rounded-full font-bold border border-green-100 dark:border-green-900/50">
                              <Timer size={10} /> {circuit.best_lap}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-slate-400">
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleToggleFavorite(circuit)}>
                          <Star size={14} className="mr-2" /> {circuit.is_favorite ? "Rimuovi Preferito" : "Aggiungi Preferito"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(circuit)}>
                          <Pencil size={14} className="mr-2" /> Modifica
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(circuit.id)} className="text-red-600">
                          <Trash2 size={14} className="mr-2" /> Elimina
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {(circuit.gearing || circuit.notes) && (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4">
                      {circuit.gearing && (
                        <div className="text-xs">
                          <span className="text-slate-400 uppercase font-bold text-[10px] block">Rapporti</span>
                          <span className="font-mono font-medium dark:text-slate-200"><Settings size={10} className="inline mr-1" />{circuit.gearing}</span>
                        </div>
                      )}
                      {circuit.notes && (
                        <div className="text-xs col-span-2">
                          <span className="text-slate-400 uppercase font-bold text-[10px] block">Note</span>
                          <p className="text-slate-600 dark:text-slate-300 line-clamp-2">{circuit.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* BOTTONE AGGIUNGI NUOVO IN FONDO ALLA LISTA */}
            <button 
              onClick={() => setIsAddOpen(true)}
              className="w-full py-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex items-center justify-center gap-2 text-slate-500 hover:text-green-600 hover:border-green-500/50 hover:bg-green-50/50 dark:hover:bg-green-900/10 transition-all group"
            >
              <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full group-hover:bg-green-100 dark:group-hover:bg-green-900/30 transition-colors">
                <Plus size={20} />
              </div>
              <span className="font-medium">Aggiungi un altro circuito</span>
            </button>
          </div>
        )}

        <TrackDialog open={isAddOpen} onOpenChange={(val) => { setIsAddOpen(val); if(!val) fetchCircuits() }} />
        {editingCircuit && <TrackDialog open={!!editingCircuit} circuit={editingCircuit} onOpenChange={(val) => { if(!val) setEditingCircuit(null); fetchCircuits() }} />}

      </div>
    </PageLayout>
  )
}