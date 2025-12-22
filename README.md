# 🏍️ SagManager

**SagManager** è una Progressive Web App (PWA) progettata per gli appassionati di giornate in pista. Sostituisce i tradizionali fogli di carta con un'interfaccia mobile-first ottimizzata per l'inserimento rapido dei dati ai box, permettendoti di tracciare setup, performance e manutenzione.

🔗 [Demo del Progetto](https://sag-manager.vercel.app/)

![Version](https://img.shields.io/badge/Version-v1.1.0-green)
![Status](https://img.shields.io/badge/Status-Active%20Dev-blue)
![License](https://img.shields.io/badge/License-MIT-gray)

## 🎯 L'Obiettivo

Ogni pilota conosce il problema: modifichi la compressione della forcella, esci per un turno, torni e ti sei dimenticato cosa hai cambiato o che passo avevi. I fogli di carta si perdono, si sporcano di grasso o si bagnano.

**SagManager ti permette di:**
1.  **Digitalizzare il Garage:** Gestisci multiple moto, ognuna con il proprio **colore identificativo** per riconoscerle a colpo d'occhio.
2.  **Calcolatore SAG Integrato:** Inserisci le misurazioni (L1, L2, L3) e l'app calcola automaticamente Static e Rider Sag, indicando se sei nel range corretto.
3.  **Modalità Confronto (Killer Feature):** Seleziona due sessioni qualsiasi e visualizza una diff "Side-by-Side" che evidenzia solo i parametri modificati (es. "Compressione: 10 -> 12").
4.  **Eredità Intelligente:** Ogni nuovo turno pre-carica automaticamente l'ultimo setup utilizzato su quella moto.
5.  **Performance & Telemetria:** Traccia Best Lap, Ideal Time, Split e Velocità Massima per ogni turno.
6.  **Manuale Integrato:** Guida utente accessibile direttamente in-app.

## 📱 Funzionalità Chiave v1.1.0

### 🔧 Gestione Sospensioni & Geometrie
Tracciamento dettagliato per Forcella e Mono:
-   **Molle & Precarico** (mm o giri)
-   **Idraulica** (Click Compressione/Estensione) con input `+` / `-` grandi per l'uso con i guanti.
-   **Geometrie:** Interasse, Inclinazione, Avancorsa (Trail).
-   **Gomme:** Pressioni a caldo/freddo e modello.

### ⏱️ Performance Tracker
Non solo setup meccanico. Per ogni turno puoi registrare:
-   Orario Inizio/Fine.
-   Best Lap, Passo Medio e Ideal Lap.
-   Split 1, 2, 3 e Top Speed.

### 📲 PWA (Progressive Web App)
L'app è installabile nativamente su iOS e Android.
-   Funziona a schermo intero (senza barre del browser).
-   Icona dedicata in Home Screen.
-   Disabilita lo zoom accidentale per un feeling nativo.

## 🛠️ Tech Stack

Costruito con uno stack moderno, scalabile e focalizzato sulle performance:

-   **Frontend:** [Next.js 15](https://nextjs.org/) (App Router)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/) + [Shadcn/UI](https://ui.shadcn.com/)
-   **Backend & Auth:** [Supabase](https://supabase.com/) (PostgreSQL)
-   **Icons:** [Lucide React](https://lucide.dev/)
-   **Feedback UI:** Sonner (Toast notifications)

## 🚀 Installazione e Setup

### Prerequisiti

-   Node.js 18+
-   Un account [Supabase](https://supabase.com/) (Il piano Free va benissimo)

### Passaggi

1.  **Clona la repository**
    ```bash
    git clone [https://github.com/TUO_USERNAME/sag-manager.git](https://github.com/TUO_USERNAME/sag-manager.git)
    cd sag-manager
    ```

2.  **Installa le dipendenze**
    ```bash
    npm install
    ```

3.  **Variabili d'Ambiente**
    Crea un file `.env.local` nella root e aggiungi le credenziali Supabase:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=la_tua_url_progetto
    NEXT_PUBLIC_SUPABASE_ANON_KEY=la_tua_chiave_anon
    ```

4.  **Setup Database**
    Esegui gli script SQL forniti nella cartella `supabase/` nel SQL Editor di Supabase per creare le tabelle (`bikes`, `track_days`, `sessions`, `circuits`).

5.  **Avvia l'App**
    ```bash
    npm run dev
    ```
    Apri [http://localhost:3000](http://localhost:3000).

## 📦 Versioning

Adottiamo il Semantic Versioning (SemVer):

-   **v1.1.0 (Corrente):** Aggiunta PWA, Calcolatore Sag, Modalità Confronto, Tab Performance, Gestione Colori Moto.
-   **v1.0.0:** Rilascio Iniziale (Gestione base sessioni e garage).

## 🤝 Contribuire

I contributi sono benvenuti!

1.  Forka il progetto
2.  Crea il tuo Feature Branch (`git checkout -b feature/NuovaFunzione`)
3.  Committa i cambiamenti (`git commit -m 'Aggiunta NuovaFunzione'`)
4.  Pusha sul Branch (`git push origin feature/NuovaFunzione`)
5.  Apri una Pull Request

## 📄 Licenza

Distribuito sotto licenza MIT.