"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// TOGGLE PREFERITO
export async function toggleFavoriteCircuit(circuitId: string, currentState: boolean) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('circuits')
    .update({ is_favorite: !currentState }) // Inverte lo stato attuale
    .eq('id', circuitId)
  
  if (error) return { error: "Errore aggiornamento" }
  
  revalidatePath("/tracks") // Ricarica la lista per aggiornare l'ordine
  return { success: true }
}

// AGGIUNGI / MODIFICA
export async function saveCircuit(formData: FormData, circuitId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Utente non loggato" }

  const name = formData.get("name") as string
  const location = formData.get("location") as string
  const length = formData.get("length") as string
  const best_lap = formData.get("best_lap") as string
  const gearing = formData.get("gearing") as string
  const notes = formData.get("notes") as string
  const map_image_url = formData.get("map_image_url") as string

  const payload = {
    user_id: user.id,
    name,
    location,
    length_meters: parseInt(length) || null,
    best_lap,
    gearing,
    notes,
    map_image_url
  }

  let error;
  
  if (circuitId) {
    // MODIFICA
    const { error: updateError } = await supabase
      .from('circuits')
      .update(payload)
      .eq('id', circuitId)
      .eq('user_id', user.id)
    error = updateError
  } else {
    // NUOVO
    const { error: insertError } = await supabase
      .from('circuits')
      .insert(payload)
    error = insertError
  }

  if (error) return { error: error.message }
  
  revalidatePath("/tracks")
  return { success: true }
}

// ELIMINA
export async function deleteCircuit(circuitId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('circuits').delete().eq('id', circuitId)
  
  if (error) return { error: "Errore eliminazione" }
  
  revalidatePath("/tracks")
  return { success: true }
}