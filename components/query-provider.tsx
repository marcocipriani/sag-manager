"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // I dati sono considerati "freschi" per 5 minuti
        staleTime: 1000 * 60 * 5, 
        // Se non usati, restano in memoria per 24 ore (fondamentale per offline)
        gcTime: 1000 * 60 * 60 * 24, 
        // Riprova 1 volta se fallisce, poi basta (evita spam di errori offline)
        retry: 1, 
        // Non rifetchare se la finestra perde focus
        refetchOnWindowFocus: false,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}