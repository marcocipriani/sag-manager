"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

type TimeFormat = "12h" | "24h"

interface PreferencesContextType {
  timeFormat: TimeFormat
  setTimeFormat: (format: TimeFormat) => void
  userName: string | null
  isLoading: boolean
}

const PreferencesContext = createContext<PreferencesContextType>({
  timeFormat: "24h",
  setTimeFormat: () => {},
  userName: null,
  isLoading: true,
})

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [timeFormat, setTimeFormatState] = useState<TimeFormat>("24h")
  const [userName, setUserName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
          .from("profiles")
          .select("time_format, full_name")
          .eq("id", user.id)
          .single()

        if (data) {
          if (data.time_format) setTimeFormatState(data.time_format as TimeFormat)
          if (data.full_name) {
             const firstName = data.full_name.split(' ')[0]
             setUserName(firstName)
          }
        }
      } catch (error) {
        console.error("Errore caricamento preferenze:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadPreferences()
  }, [])

  const setTimeFormat = async (format: TimeFormat) => {
    setTimeFormatState(format)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from("profiles").update({ time_format: format }).eq("id", user.id)
    }
  }

  return (
    <PreferencesContext.Provider value={{ timeFormat, setTimeFormat, userName, isLoading }}>
      {children}
    </PreferencesContext.Provider>
  )
}

export const usePreferences = () => useContext(PreferencesContext)