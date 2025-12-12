// src/app/history/page.tsx
import Link from "next/link"
import { PageLayout } from "@/components/layout/page-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  MapPin, 
  Bike, 
  ChevronRight, 
  Search,
  Timer
} from "lucide-react"

// --- MOCK DATA ---
// Simulating data fetched from Supabase
const historyData = [
  {
    id: 1,
    date: "12 Nov 2024",
    circuit: "Vallelunga",
    bike: "Yamaha R1 2019",
    sessionsCount: 5,
    bestLap: "1:45.3",
    weather: "Soleggiato"
  },
  {
    id: 2,
    date: "15 Ott 2024",
    circuit: "Mugello",
    bike: "Yamaha R1 2019",
    sessionsCount: 4,
    bestLap: "2:02.1",
    weather: "Nuvoloso"
  },
  {
    id: 3,
    date: "02 Set 2024",
    circuit: "Misano",
    bike: "Ducati Panigale V4",
    sessionsCount: 6,
    bestLap: "1:43.8",
    weather: "Caldo"
  }
]

export default function HistoryPage() {
  return (
    <PageLayout title="Storico Giornate">
      
      {/* SECTION 1: SEARCH FILTER */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <Input 
          placeholder="Cerca circuito o data..." 
          className="pl-9 border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:focus-visible:ring-green-500"
        />
      </div>

      {/* SECTION 2: HISTORY LIST */}
      <div className="space-y-4">
        {historyData.map((day) => (
          <Link href={`/history/${day.id}`} key={day.id} className="block group">
            <Card className="hover:border-green-500 dark:hover:border-green-500 transition-all cursor-pointer border-slate-200 dark:border-slate-800 dark:bg-slate-900 shadow-sm hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
                      <Calendar size={12} />
                      <span>{day.date}</span>
                    </div>
                    <CardTitle className="text-lg dark:text-white flex items-center gap-2">
                      {day.circuit}
                    </CardTitle>
                  </div>
                  
                  {/* Weather Badge (Optional decoration) */}
                  <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-normal">
                    {day.weather}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center justify-between mt-2">
                  
                  {/* Left: Bike Info */}
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <Bike size={16} className="text-green-600 dark:text-green-400" />
                    <span>{day.bike}</span>
                  </div>

                  {/* Right: Lap/Session Stats */}
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1 text-sm font-bold text-slate-900 dark:text-white">
                      <Timer size={14} className="text-slate-400" />
                      {day.bestLap}
                    </div>
                    <p className="text-xs text-slate-400">
                      {day.sessionsCount} sessioni
                    </p>
                  </div>

                </div>
              </CardContent>
              
              {/* Decoration: Subtle green bar on hover (left side) */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-l-xl" />
            </Card>
          </Link>
        ))}
      </div>

      {/* EMPTY STATE PLACEHOLDER (Hidden if data exists) */}
      {historyData.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-slate-100 dark:bg-slate-800 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="text-slate-400" size={32} />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">Nessuna giornata trovata</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Inizia una nuova sessione per salvare i tuoi dati.
          </p>
        </div>
      )}

    </PageLayout>
  )
}