"use client"

import { PageLayout } from "@/components/layout/page-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Bike, Map, ClipboardList, ArrowLeftRight, Download, Save, Settings 
} from "lucide-react"

export default function GuidePage() {
  return (
    <PageLayout title="Manuale Utente" showBackButton>
      <div className="space-y-6 pb-20 max-w-2xl mx-auto">
        
        {/* INTRO */}
        <div className="prose dark:prose-invert">
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Benvenuto in <strong>SagManager</strong>, il tuo assistente digitale per la gestione dei setup in pista. 
            Questa guida ti aiuterà a sfruttare al massimo ogni funzionalità.
          </p>
        </div>

        {/* 1. GARAGE */}
        <Section 
          icon={<Bike className="text-blue-500" />} 
          title="1. Il Garage"
        >
          <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li>
              <strong>Aggiungi Moto:</strong> Inserisci Marca, Modello, Anno e un colore identificativo. Il colore ti aiuterà a distinguere visivamente le moto nelle liste.
            </li>
            <li>
              <strong>Moto Attiva:</strong> Puoi avere più moto, ma solo una è "Attiva" (segnalata in verde). La moto attiva viene selezionata automaticamente quando crei una nuova sessione.
            </li>
            <li>
              <strong>Modifica:</strong> Clicca sul menu (tre puntini) della card per modificare i dettagli o il colore.
            </li>
          </ul>
        </Section>

        {/* 2. CIRCUITI */}
        <Section 
          icon={<Map className="text-green-500" />} 
          title="2. Gestione Circuiti"
        >
          <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li>
              <strong>Database:</strong> Salva i tuoi circuiti preferiti con dati come rapporti e best lap.
            </li>
            <li>
              <strong>Mappe e Meteo:</strong> Carica l'immagine del layout per averla sempre sott'occhio. Usa i link rapidi per aprire Google Maps o vedere il Meteo locale.
            </li>
            <li>
              <strong>Preferiti:</strong> Clicca la stella ⭐ per mettere i circuiti che frequenti di più in cima alla lista.
            </li>
          </ul>
        </Section>

        {/* 3. SESSIONI */}
        <Section 
          icon={<Save className="text-orange-500" />} 
          title="3. Salvare un Setup"
        >
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
            Vai su <strong>"Nuova Sessione"</strong> per registrare i dati. L'app pre-carica automaticamente l'ultimo setup usato su quella moto per farti risparmiare tempo.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li><strong>Dati Generali:</strong> Pressione gomme, meteo, temperatura.</li>
            <li><strong>Sospensioni:</strong> Click di compressione, estensione, precarico (Forcella e Mono).</li>
            <li><strong>Geometrie:</strong> Interasse, sfilamento forcella, altezza mono.</li>
          </ul>
        </Section>

        {/* 4. CONFRONTO */}
        <Section 
          icon={<ArrowLeftRight className="text-purple-500" />} 
          title="4. Storico e Confronto"
        >
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
            Non ricordi cosa hai cambiato rispetto alla mattina?
          </p>
          <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li>Vai nella pagina <strong>Storico</strong>.</li>
            <li>Clicca il tasto <strong>"Confronta"</strong> in alto a destra.</li>
            <li>Seleziona <strong>due sessioni</strong> qualsiasi.</li>
            <li>Premi il tasto verde in basso.</li>
          </ol>
          <p className="text-sm mt-2 text-slate-600 dark:text-slate-300">
            Si aprirà una vista che evidenzia in <strong>giallo</strong> solo i valori che sono cambiati tra le due sessioni.
          </p>
        </Section>

        {/* 5. INSTALLAZIONE */}
        <Section 
          icon={<Download className="text-slate-500" />} 
          title="5. Installazione (App)"
        >
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Puoi installare SagManager come una vera app sul telefono:
          </p>
          <div className="mt-3 grid grid-cols-1 gap-2">
            <Badge variant="outline" className="justify-start p-2 gap-2">
              <span className="font-bold">iOS (iPhone):</span> Tasto Condividi Safari → "Aggiungi alla schermata Home"
            </Badge>
            <Badge variant="outline" className="justify-start p-2 gap-2">
              <span className="font-bold">Android:</span> Menu Chrome (3 puntini) → "Installa App"
            </Badge>
          </div>
        </Section>

      </div>
    </PageLayout>
  )
}

// Componente di supporto per le sezioni
function Section({ icon, title, children }: { icon: any, title: string, children: React.ReactNode }) {
  return (
    <Card className="dark:bg-slate-900 border-slate-200 dark:border-slate-800">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
            {icon}
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {title}
          </h2>
        </div>
        {children}
      </CardContent>
    </Card>
  )
}