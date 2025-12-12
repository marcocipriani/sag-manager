import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  // 1. Creiamo una risposta iniziale vuota
  let supabaseResponse = NextResponse.next({
    request,
  });

  // 2. Creiamo il client Supabase server-side
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // A. Aggiorniamo i cookie nella richiesta (per il middleware corrente)
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          
          // B. Ricreiamo la risposta per includere i nuovi cookie
          supabaseResponse = NextResponse.next({
            request,
          });
          
          // C. Settiamo i cookie nella risposta finale (per il browser)
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 3. Verifica Utente (Protezione Rotte)
  // IMPORTANTE: getUser() valida il token sul server DB, più sicuro di getSession()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 4. Logica di Redirect
  // Se l'utente NON è loggato E non si trova già nelle pagine di login/auth...
  if (
    !user &&
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/auth")
  ) {
    // ...reindirizzalo al login
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // 5. Ritorniamo la risposta con i cookie sincronizzati
  return supabaseResponse;
}