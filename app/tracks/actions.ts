"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// PREFERITO
export async function toggleFavoriteCircuit(circuitId: string, currentState: boolean) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('circuits')
    .update({ is_favorite: !currentState })
    .eq('id', circuitId)
  
  if (error) return { error: "Errore aggiornamento" }
  
  revalidatePath("/tracks")
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

export async function importFamousCircuits() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, message: "Utente non loggato" }

  // Lista predefinita dei principali circuiti italiani
  const famousTracks = [
    { name: "Mugello Circuit", location: "Scarperia e San Piero, FI", length_meters: 5245 },
    { name: "Misano World Circuit", location: "Misano Adriatico, RN", length_meters: 4226 },
    { name: "Autodromo di Imola", location: "Imola, BO", length_meters: 4909 },
    { name: "Autodromo di Monza", location: "Monza, MB", length_meters: 5793 },
    { name: "Vallelunga", location: "Campagnano di Roma, RM", length_meters: 4085 },
    { name: "Cremona Circuit", location: "San Martino del Lago, CR", length_meters: 3702 },
    { name: "Autodromo del Levante", location: "Binetto, BA", length_meters: 1577 },
    { name: "Tazio Nuvolari", location: "Cervesina, PV", length_meters: 2805 },
    { name: "Autodromo dell'Umbria", location: "Magione, PG", length_meters: 2507 },
    { name: "Autodromo di Modena", location: "Modena, MO", length_meters: 2007 },
  ]

  let addedCount = 0

  for (const track of famousTracks) {
    const { data: existing } = await supabase
      .from('circuits')
      .select('id')
      .eq('user_id', user.id)
      .ilike('name', track.name) 
      .maybeSingle()

    if (!existing) {
      await supabase.from('circuits').insert({
        user_id: user.id,
        name: track.name,
        location: track.location,
        length_meters: track.length_meters,
        is_favorite: false
      })
      addedCount++
    }
  }

  revalidatePath('/tracks')
  return { success: true, count: addedCount }
}