"use client"

import { createContext, useContext, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

type OfflineAction = {
  id: string
  table: string
  payload: any
}

const SyncContext = createContext<{
  saveData: (table: string, payload: any) => Promise<boolean>
}>({ saveData: async () => false })

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const router = useRouter()

  const processQueue = async () => {
    if (!navigator.onLine) return

    const queueStr = localStorage.getItem("offline_queue")
    if (!queueStr) return

    const queue: OfflineAction[] = JSON.parse(queueStr)
    if (queue.length === 0) return

    const loadingToast = toast.loading(`Sincronizzazione di ${queue.length} elementi...`)
    
    const failedQueue: OfflineAction[] = []
    let successCount = 0

    for (const item of queue) {
      try {
        const { error } = await supabase.from(item.table).insert(item.payload)
        if (error) throw error
        successCount++
      } catch (e) {
        console.error(e)
        failedQueue.push(item)
      }
    }

    localStorage.setItem("offline_queue", JSON.stringify(failedQueue))
    toast.dismiss(loadingToast)

    if (successCount > 0) {
      toast.success(`${successCount} elementi sincronizzati!`)
      router.refresh()
    }
    
    if (failedQueue.length > 0) {
      toast.error(`${failedQueue.length} elementi non sincronizzati. Riproveremo dopo.`)
    }
  }

  useEffect(() => {
    window.addEventListener("online", processQueue)
    processQueue()
    return () => window.removeEventListener("online", processQueue)
  }, [])

  const saveData = async (table: string, payload: any) => {
    if (navigator.onLine) {
      const { error } = await supabase.from(table).insert(payload)
      if (error) {
        toast.error("Errore salvataggio server")
        return false
      }
      return true
    } else {
      const newItem: OfflineAction = {
        id: crypto.randomUUID(),
        table,
        payload
      }
      
      const currentQueue = JSON.parse(localStorage.getItem("offline_queue") || "[]")
      currentQueue.push(newItem)
      localStorage.setItem("offline_queue", JSON.stringify(currentQueue))
      
      toast.info("Salvato offline. Verrà caricato appena connesso.", {
        icon: "💾"
      })
      return true
    }
  }

  return (
    <SyncContext.Provider value={{ saveData }}>
      {children}
    </SyncContext.Provider>
  )
}

export const useSync = () => useContext(SyncContext)