"use client"

import { useState, useEffect } from "react"
import { WifiOff } from "lucide-react"

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine)
    }

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (isOnline) return null

  return (
    <div className="bg-amber-500 text-white text-xs font-bold text-center py-2 px-4 flex items-center justify-center gap-2 sticky top-0 z-[100] animate-in slide-in-from-top">
      <WifiOff size={14} />
      Sei offline. Alcune funzionalità potrebbero essere limitate.
    </div>
  )
}