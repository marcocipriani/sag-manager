import { Suspense } from "react"
import SessionDetail from "./session-detail" // Il componente client creato prima
import { Loader2 } from "lucide-react"

// 1. Componente server che "risolve" la promessa dei parametri
//    Questo componente verrà eseguito SOLO quando i dati sono pronti
async function SessionResolver({ paramsPromise }: { paramsPromise: Promise<{ id: string }> }) {
  // Qui è sicuro fare await perché siamo dentro Suspense
  const { id } = await paramsPromise
  return <SessionDetail id={id} />
}

// 2. Pagina Principale (Guscio esterno)
//    Questa parte carica istantaneamente e mostra il fallback mentre risolve l'ID
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense 
      fallback={
        <div className="flex justify-center pt-40">
          <Loader2 className="animate-spin text-green-600 h-10 w-10" />
        </div>
      }
    >
      <SessionResolver paramsPromise={params} />
    </Suspense>
  )
}