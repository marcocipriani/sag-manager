// src/app/tracks/page.tsx
import { PageLayout } from "@/components/layout/page-layout" // Nuovo layout
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin } from "lucide-react"

export default function TracksPage() {
  return (
    // Niente più div manuali!
    <PageLayout title="Circuiti">
        <Card className="dark:bg-slate-900 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full text-red-600 dark:text-red-400">
              <MapPin size={24} />
            </div>
            <div>
              <CardTitle className="text-lg dark:text-white">Vallelunga</CardTitle>
              <span className="text-xs text-slate-500 dark:text-slate-400">Campagnano di Roma</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Lunghezza: 4.1 km <br />
              Best Lap: 1:45.3
            </p>
          </CardContent>
        </Card>
    </PageLayout>
  )
}