"use client"

import { PageLayout } from "@/components/layout/page-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Bike, Map, ArrowLeftRight, Download, Save, Settings, 
  FileText, CloudDownload, Sliders, Star, Sparkles
} from "lucide-react"

export default function GuidePage() {
  return (
    <PageLayout title="Manuale Utente" showBackButton>
      <div className="space-y-6 pb-20 max-w-2xl mx-auto">
        
        {/* INTRO */}
        <div className="prose dark:prose-invert">
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Benvenuto in <strong>SagManager</strong>. Questa guida ti aiuterà a sfruttare al massimo ogni funzionalità dell'app.
          </p>
        </div>

        {/* --- SEZIONE NOVITÀ v1.2.0 --- */}
        <Card className="border-green-500/30 bg-green-50/50 dark:bg-green-900/10 dark:border-green-500/30 overflow-hidden">
          <CardHeader className="pb-3 border-b border-green-200 dark:border-green-800/50">
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400 text-lg">
              <Sparkles size={20} className="fill-green-500/20" /> 
              Novità Versione 1.2.0
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <FileText size={16} className="mt-0.5 text-blue-500 shrink-0" />
                <span>
                  <strong>Esporta PDF:</strong> Ora puoi scaricare una scheda tecnica completa della tua sessione in formato PDF da condividere o stampare.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CloudDownload size={16} className="mt-0.5 text-blue-500 shrink-0" />
                <span>
                  <strong>Importa Circuiti:</strong> Nella gestione circuiti, puoi scaricare con un click i principali autodromi italiani senza inserirli a mano.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Sliders size={16} className="mt-0.5 text-blue-500 shrink-0" />
                <span>
                  <strong>Configurazione Campi:</strong> Nelle impostazioni puoi nascondere i campi che non usi (es. Alte-Basse velocità) per rendere la scheda più pulita.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Settings size={16} className="mt-0.5 text-blue-500 shrink-0" />
                <span>
                  <strong>Preferenze:</strong> Aggiunto supporto per formato orario (12h/24h) e unità di pressione (Bar/Psi).
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* 1. GARAGE & DASHBOARD */}
        <Section 
          icon={<Bike className="text-blue-500" />} 
          title="1. Garage & Dashboard"
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

        {/* 2. CIRCUITI */}
        <Section 
          icon={<Map className="text-green-500" />} 
          title="2. Gestione Circuiti"
        >
          <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li>
              <strong>Importazione Rapida:</strong> Usa il tasto <em>"Importa Default"</em> per caricare automaticamente circuiti come Mugello, Misano, Vallelunga, ecc.
            </li>
            <li>
              <strong>Mappe e Meteo:</strong> Ogni circuito ha link rapidi per il Navigatore e per le previsioni Meteo locali.
            </li>
            <li>
              <strong>Preferiti:</strong> Clicca la stella <Star size={12} className="inline text-yellow-400 fill-yellow-400"/> per mettere i circuiti che frequenti di più in cima alla lista.
            </li>
          </ul>
        </Section>

        {/* 3. SESSIONI */}
        <Section 
          icon={<Save className="text-orange-500" />} 
          title="3. Registrare un Setup"
        >
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
            Vai su <strong>"Nuova Sessione"</strong> per registrare i dati. L'app pre-carica automaticamente l'ultimo setup usato su quella moto.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li><strong>Dati Generali:</strong> Pressione gomme (Bar o Psi), meteo, temperatura.</li>
            <li><strong>Sospensioni:</strong> Click di compressione, estensione, precarico.</li>
            <li><strong>Note:</strong> Un campo testo libero per le tue sensazioni di guida.</li>
            <li>
              <strong>Export PDF:</strong> Una volta salvata la sessione, apri il dettaglio e clicca l'icona <FileText size={12} className="inline"/> in alto a destra per generare il PDF.
            </li>
          </ul>
        </Section>

        {/* 4. IMPOSTAZIONI AVANZATE */}
        <Section 
          icon={<Settings className="text-slate-500" />} 
          title="4. Personalizzazione (Settings)"
        >
          <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li>
              <strong>Configurazione Campi:</strong> Se la tua moto non ha le regolazioni per le "Alte Velocità" o non ti interessa tracciare l'olio forcella, vai su <em>Impostazioni &gt; Configurazione Campi Avanzata</em> e disabilitali. La scheda di inserimento diventerà più semplice.
            </li>
            <li>
              <strong>Unità di Misura:</strong> Scegli tra Bar e Psi per le gomme.
            </li>
            <li>
              <strong>Orario:</strong> Scegli il formato 12 ore (AM/PM) o 24 ore.
            </li>
          </ul>
        </Section>

        {/* 5. CONFRONTO */}
        <Section 
          icon={<ArrowLeftRight className="text-purple-500" />} 
          title="5. Storico e Confronto"
        >
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
            Non ricordi cosa hai cambiato rispetto alla mattina?
          </p>
          <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li>Vai nella pagina <strong>Storico</strong>.</li>
            <li>Clicca il tasto <strong>"Confronta"</strong> in alto a destra.</li>
            <li>Seleziona <strong>due sessioni</strong> qualsiasi.</li>
            <li>Premi il tasto verde <strong>"Confronta (2)"</strong>.</li>
          </ol>
          <p className="text-sm mt-2 text-slate-600 dark:text-slate-300">
            Si aprirà una vista che evidenzia in <strong>giallo</strong> solo i valori che sono cambiati tra le due sessioni.
          </p>
        </Section>

        {/* 6. INSTALLAZIONE */}
        <Section 
          icon={<Download className="text-slate-500" />} 
          title="6. Installazione (PWA)"
        >
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Puoi installare SagManager come un'app nativa sul telefono:
          </p>
          <div className="mt-3 grid grid-cols-1 gap-2">
            <Badge variant="outline" className="justify-start p-2 gap-2 font-normal">
              <span className="font-bold">iOS:</span> Tasto Condividi Safari → "Aggiungi alla schermata Home"
            </Badge>
            <Badge variant="outline" className="justify-start p-2 gap-2 font-normal">
              <span className="font-bold">Android:</span> Menu Chrome (3 puntini) → "Installa App"
            </Badge>
          </div>
        </Section>

      </div>
    </PageLayout>
  )
}

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