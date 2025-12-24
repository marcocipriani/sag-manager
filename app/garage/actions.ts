"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createBike(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "Non autorizzato" }

  const data = {
    user_id: user.id,
    brand: formData.get("brand") as string,
    model: formData.get("model") as string,
    name: formData.get("name") as string,
    year: parseInt(formData.get("year") as string),
    weight: parseFloat(formData.get("weight") as string),
    color: formData.get("color") as string,
    is_active: false
  }

  const { error } = await supabase.from("bikes").insert(data)
  if (error) return { error: error.message }

  revalidatePath("/garage")
  revalidatePath("/")
  return { success: true }
}

export async function updateBike(bikeId: string, formData: FormData) {
  const supabase = await createClient()
  
  const data = {
    brand: formData.get("brand") as string,
    model: formData.get("model") as string,
    name: formData.get("name") as string,
    year: parseInt(formData.get("year") as string),
    weight: parseFloat(formData.get("weight") as string),
    color: formData.get("color") as string,
  }

  const { error } = await supabase.from("bikes").update(data).eq("id", bikeId)
  if (error) return { error: error.message }

  revalidatePath("/garage")
  revalidatePath("/")
  return { success: true }
}

export async function deleteBike(bikeId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("bikes").delete().eq("id", bikeId)
  
  if (error) return { error: error.message }
  
  revalidatePath("/garage")
  revalidatePath("/")
  return { success: true }
}

export async function setActiveBike(bikeId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: "Non autorizzato" }

  await supabase.from("bikes").update({ is_active: false }).eq("user_id", user.id)
  const { error } = await supabase.from("bikes").update({ is_active: true }).eq("id", bikeId)

  if (error) return { error: error.message }

  revalidatePath("/garage")
  revalidatePath("/")
  return { success: true }
}