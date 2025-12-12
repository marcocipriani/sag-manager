import Link from "next/link"
import { PageLayout } from "@/components/layout/page-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  PlusCircle, 
  Bike, 
  History, 
  ChevronRight, 
  MapPin,
  User
} from "lucide-react"

export default function Home() {
  
  // Action Header: Settings Link
  const headerActions = (
    <div className="flex items-center gap-1">
      <Link href="/settings">
        <Button variant="ghost" size="icon" className="rounded-full">
          <div className="h-8 w-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-green-500 transition-colors">
            <User size={18} />
          </div>
        </Button>
      </Link>
    </div>
  )

  return (
    <PageLayout title="SagManager" isHomePage action={headerActions}>
      
      {/* 1. MAIN CTA: NEW SESSION (Top Priority) */}
      <Link href="/new-session" className="block group">
        <Card className="bg-slate-900 dark:bg-slate-900 border-slate-800 dark:border-slate-700 text-white shadow-xl hover:shadow-green-900/20 hover:border-green-500/50 transition-all relative overflow-hidden">
          <div className="absolute -right-10 -top-10 bg-green-500 h-40 w-40 rounded-full opacity-10 blur-3xl group-hover:opacity-20 transition-opacity"></div>
          
          <CardContent className="flex items-center justify-between p-6 relative z-10">
            <div className="space-y-2">
              <CardTitle className="text-2xl flex items-center gap-3">
                <PlusCircle className="text-green-400" size={28} /> 
                <span>Nuova Sessione</span>
              </CardTitle>
              <CardDescription className="text-slate-400 font-medium">
                Registra setup per Yamaha R1
              </CardDescription>
            </div>
            <div className="bg-slate-800 p-2 rounded-full group-hover:bg-green-600 transition-colors">
                <ChevronRight className="text-white" />
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* 2. SECONDARY ACTIONS GRID */}
      <div className="grid grid-cols-2 gap-4">
        {/* History */}
        <Link href="/history">
          <Card className="h-full hover:border-green-500 dark:hover:border-green-500 hover:shadow-md transition-all cursor-pointer bg-white dark:bg-slate-900 dark:border-slate-800">
            <CardHeader className="p-5 pb-2">
              <History className="h-7 w-7 text-slate-600 dark:text-slate-400 mb-2 group-hover:text-green-500 transition-colors" />
              <CardTitle className="text-base text-slate-900 dark:text-slate-100">Storico</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <CardDescription className="text-xs text-slate-500 dark:text-slate-500">
                Le tue giornate
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        {/* Tracks */}
        <Link href="/tracks">
          <Card className="h-full hover:border-green-500 dark:hover:border-green-500 hover:shadow-md transition-all cursor-pointer bg-white dark:bg-slate-900 dark:border-slate-800">
            <CardHeader className="p-5 pb-2">
              <MapPin className="h-7 w-7 text-slate-600 dark:text-slate-400 mb-2 group-hover:text-green-500 transition-colors" />
              <CardTitle className="text-base text-slate-900 dark:text-slate-100">Circuiti</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <CardDescription className="text-xs text-slate-500 dark:text-slate-500">
                Note e riferimenti
              </CardDescription>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* 3. GARAGE SECTION */}
      <div className="space-y-3 pt-2">
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
          Il tuo Garage
        </h3>
        
        {/* Active Bike Widget */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-green-50 dark:bg-green-500/10 p-3 rounded-xl text-green-600 dark:text-green-400">
              <Bike size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                In uso ora
              </p>
              <p className="text-base font-bold text-slate-900 dark:text-white">
                Yamaha R1 2019
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-green-600 dark:text-green-400 text-xs font-bold hover:bg-green-50 dark:hover:bg-green-900/20">
            CAMBIA
          </Button>
        </div>

        {/* Link to Full Garage */}
        <Link href="/garage">
          <Button variant="outline" className="w-full justify-between dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 h-12">
            <span className="flex items-center gap-2">
              <Bike size={16} /> Gestisci tutte le moto
            </span>
            <ChevronRight size={16} />
          </Button>
        </Link>
      </div>

    </PageLayout>
  )
}