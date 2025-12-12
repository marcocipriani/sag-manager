// src/app/history/[id]/page.tsx
import SessionDetail from "./session-detail"

// Questa pagina è un Server Component (default in Next.js 13+)
// Riceve i params come Promise, li risolve e passa l'ID al componente client
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <SessionDetail id={id} />
}