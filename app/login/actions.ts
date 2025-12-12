"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
// ATTENZIONE: Verifica se il tuo file è in @/utils/supabase/server o @/lib/supabase/server
import { createClient } from "@/lib/supabase/server"; 

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return redirect("/login?message=Credenziali non valide");
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  
  // Costruiamo l'URL per il callback usando la variabile d'ambiente o localhost
  const origin = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Qui usiamo la route che hai già in app/auth/callback/route.ts
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return redirect("/login?message=Errore registrazione");
  }

  return redirect("/login?message=Controlla la tua email per confermare");
}

export async function signout() {
  const supabase = await createClient();

  // 1. Distrugge la sessione Supabase (e cancella i cookie)
  await supabase.auth.signOut();

  // 2. Reindirizza alla pagina di login
  redirect("/login");
}