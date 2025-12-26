import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"

export function useCircuits() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['circuits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('circuits')
        .select('*')
        .order('name', { ascending: true })
      
      if (error) throw error
      return data
    },
  })
}