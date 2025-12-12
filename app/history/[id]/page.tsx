// src/app/history/[id]/page.tsx
import SessionDetail from "./session-detail"

// Server Component: Gestisce i parametri asincroni (obbligatorio in Next 15)
// e passa il controllo al Client Component
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <SessionDetail id={id} />
}