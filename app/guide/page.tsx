"use client"

import { PageLayout } from "@/components/layout/page-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Bike, Map, ArrowLeftRight, Download, Save, Settings, 
  FileText, CloudDownload, Sliders, Star, Wifi, WifiOff, RefreshCw, Smartphone
} from "lucide-react"

export default function GuidePage() {
  return (
    <PageLayout title="Manuale Utente" showBackButton>
      <div className="space-y-6 pb-20 max-w-2xl mx-auto">
        
        {/* INTRO */}
        <div className="prose dark:prose-invert">
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Benvenuto in <strong>SagManager v1.3</strong>. Questa guida ti aiuterà a sfruttare al massimo le nuove funzionalità offline e la gestione del setup.
          </p>
        </div>

        {/* --- SEZIONE NOVITÀ v1.3.0 --- */}
        <Card className="border-green-500/30 bg-green-50/50 dark:bg-green-900/10 dark:border-green-500/30 overflow-hidden">
          <CardHeader className="pb-3 border-b border-green-200 dark:border-green-800/50">
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400 text-lg">
              <RefreshCw size={20} className="text-green-600" /> 
              Novità v1.3.0: Offline First
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <WifiOff size={16} className="mt-0.5 text-blue-500 shrink-0" />
                <span>
                  <strong>Modalità Offline:</strong> L'app ora funziona anche senza connessione internet. Puoi consultare il garage, lo storico e i circuiti ovunque ti trovi, anche nei paddock schermati.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Save size={16} className="mt-0.5 text-blue-500 shrink-0" />
                <span>
                  <strong>Salvataggio Sicuro:</strong> Se salvi una sessione mentre sei offline, i dati vengono custoditi nel tuo dispositivo.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <RefreshCw size={16} className="mt-0.5 text-blue-500 shrink-0" />
                <span>
                  <strong>Sincronizzazione Automatica:</strong> Non appena il telefono ritrova il segnale, l'app invia automaticamente i dati salvati al cloud senza che tu debba fare nulla.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Smartphone size={16} className="mt-0.5 text-blue-500 shrink-0" />
                <span>
                  <strong>PWA Potenziata:</strong> Installazione più rapida e avvio istantaneo come un'app nativa.
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* 1. FUNZIONAMENTO OFFLINE */}
        <Section 
          icon={<Wifi className="text-amber-500" />} 
          title="1. Gestione Connessione"
        >
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
            SagManager monitora costantemente lo stato della rete.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li>
              <strong>Banner Arancione:</strong> Se vedi un avviso "Sei Offline" in alto, significa che l'app sta lavorando in modalità locale.
            </li>
            <li>
              <strong>Lettura Dati:</strong> Puoi vedere tutte le sessioni, le moto e i circuiti caricati in precedenza.
            </li>
            <li>
              <strong>Scrittura Dati:</strong> Quando premi "Salva Turno" senza rete, riceverai una notifica che il dato è stato salvato <em>in locale</em>. Verrà sincronizzato (caricato sul server) automaticamente al ritorno della connessione.
            </li>
          </ul>
        </Section>

        {/* 2. GARAGE & DASHBOARD */}
        <Section 
          icon={<Bike className="text-blue-500" />} 
          title="2. Garage & Dashboard"
        >
          <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li>
              <strong>Moto Attiva:</strong> Nella Home trovi il widget della tua moto. Usa il tasto <em>"Cambia"</em> per passare velocemente da una moto all'altra o <em>"Garage"</em> per gestirle.
            </li>
            <li>
              <strong>Colore:</strong> Assegna un colore ad ogni moto per riconoscerla a colpo d'occhio nello storico sessioni.
            </li>
          </ul>
        </Section>

        {/* 3. CIRCUITI */}
        <Section 
          icon={<Map className="text-green-500" />} 
          title="3. Gestione Circuiti"
        >
          <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li>
              <strong>Importazione Rapida:</strong> Usa il tasto <em>"Importa"</em> per scaricare automaticamente i principali autodromi italiani (Mugello, Misano, Vallelunga, ecc.).
            </li>
            <li>
              <strong>Mappe e Meteo:</strong> Link rapidi per Navigatore e Meteo (richiedono connessione).
            </li>
            <li>
              <strong>Preferiti:</strong> Clicca la stella <Star size={12} className="inline text-yellow-400 fill-yellow-400"/> per i tuoi circuiti frequenti.
            </li>
          </ul>
        </Section>

        {/* 4. REGISTRARE UN SETUP */}
        <Section 
          icon={<Save className="text-orange-500" />} 
          title="4. Nuova Sessione"
        >
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
            Vai su <strong>"Nuova Sessione"</strong>. L'app pre-carica automaticamente l'ultimo setup usato su quella moto.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li><strong>Dati Generali:</strong> Pressione gomme (Bar/Psi), meteo, temperatura.</li>
            <li><strong>Sospensioni:</strong> Click di compressione, estensione, precarico e misurazioni SAG con calcolatrice integrata.</li>
            <li><strong>Note:</strong> Campo libero per le tue sensazioni.</li>
            <li>
              <strong>Export PDF:</strong> Dallo storico sessioni, clicca l'icona <FileText size={12} className="inline"/> per generare e condividere la scheda tecnica (funzionalità Online).
            </li>
          </ul>
        </Section>

        {/* 5. IMPOSTAZIONI & PERSONALIZZAZIONE */}
        <Section 
          icon={<Settings className="text-slate-500" />} 
          title="5. Personalizzazione"
        >
          <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li>
              <strong>Configurazione Campi:</strong> Vai su <em>Impostazioni &gt; Configurazione Campi Avanzata</em> per nascondere i dati che non usi (es. Alte/Basse velocità o Livello Olio) e semplificare l'interfaccia.
            </li>
            <li>
              <strong>Unità di Misura:</strong> Scegli tra Bar e Psi per le gomme.
            </li>
            <li>
              <strong>Orario:</strong> Scegli il formato 12 ore (AM/PM) o 24 ore.
            </li>
          </ul>
        </Section>

        {/* 6. INSTALLAZIONE */}
        <Section 
          icon={<Download className="text-purple-500" />} 
          title="6. Installazione App"
        >
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Installa SagManager come app nativa per avere l'icona sulla home e la modalità schermo intero.
          </p>
          <div className="mt-3 grid grid-cols-1 gap-2">
            <Badge variant="outline" className="justify-start p-2 gap-2 font-normal bg-slate-50 dark:bg-slate-800">
              <span className="font-bold">iOS (iPhone):</span> Tasto Condividi Safari → "Aggiungi alla schermata Home"
            </Badge>
            <Badge variant="outline" className="justify-start p-2 gap-2 font-normal bg-slate-50 dark:bg-slate-800">
              <span className="font-bold">Android:</span> Premi "Installa App" dal menu del browser o dal banner automatico.
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
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg shadow-sm">
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