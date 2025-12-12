"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// 1. Aggiungi Nuova Moto
export async function addBike(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Utente non loggato" }

  const brand = formData.get("brand") as string
  const model = formData.get("model") as string
  const year = formData.get("year") as string
  const name = formData.get("name") as string
  const weight = formData.get("weight") as string

  // Controlla se è la prima moto in assoluto (se sì, la rendiamo attiva di default)
  const { count } = await supabase.from('bikes').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
  const isFirstBike = count === 0

  const { error } = await supabase.from('bikes').insert({
    user_id: user.id,
    brand,
    model,
    year: parseInt(year),
    name: name || `${brand} ${model}`, // Se non dai un nome, usa Marca Modello
    weight: parseFloat(weight) || 0,
    is_active: isFirstBike // True se è la prima, altrimenti False
  })

  if (error) return { error: error.message }
  
  revalidatePath("/garage") // Aggiorna la pagina
  revalidatePath("/") // Aggiorna anche la home
  return { success: true }
}

// 2. Imposta Moto Attiva (Logica Esclusiva: solo una può essere attiva)
export async function setActiveBike(bikeId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // A. Mettiamo TUTTE le moto dell'utente a false
  await supabase.from('bikes').update({ is_active: false }).eq('user_id', user.id)

  // B. Mettiamo QUELLA selezionata a true
  await supabase.from('bikes').update({ is_active: true }).eq('id', bikeId).eq('user_id', user.id)

  revalidatePath("/garage")
  revalidatePath("/")
}

// 3. Elimina Moto
export async function deleteBike(bikeId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase.from('bikes').delete().eq('id', bikeId)
  
  if (error) {
    console.error(error)
    return { error: "Impossibile eliminare" }
  }

  revalidatePath("/garage")
  return { success: true }
}