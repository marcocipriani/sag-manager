// Mappa dei colori disponibili
export const BIKE_COLORS = [
  { id: 'slate',  label: 'Neutro',   class: 'bg-slate-500',  border: 'border-slate-500',  bgLight: 'bg-slate-500/10' },
  { id: 'red',    label: 'Rosso',    class: 'bg-red-600',    border: 'border-red-600',    bgLight: 'bg-red-600/10' },
  { id: 'orange', label: 'Arancio',  class: 'bg-orange-500', border: 'border-orange-500', bgLight: 'bg-orange-500/10' },
  { id: 'amber',  label: 'Giallo',   class: 'bg-amber-400',  border: 'border-amber-400',  bgLight: 'bg-amber-400/10' },
  { id: 'green',  label: 'Verde',    class: 'bg-green-600',  border: 'border-green-600',  bgLight: 'bg-green-600/10' },
  { id: 'cyan',   label: 'Azzurro',  class: 'bg-cyan-500',   border: 'border-cyan-500',   bgLight: 'bg-cyan-500/10' },
  { id: 'blue',   label: 'Blu',      class: 'bg-blue-600',   border: 'border-blue-600',   bgLight: 'bg-blue-600/10' },
  { id: 'violet', label: 'Viola',    class: 'bg-violet-600', border: 'border-violet-600', bgLight: 'bg-violet-600/10' },
  { id: 'pink',   label: 'Rosa',     class: 'bg-pink-500',   border: 'border-pink-500',   bgLight: 'bg-pink-500/10' },
]

export const getBikeColor = (id: string | null) => {
  return BIKE_COLORS.find(c => c.id === id) || BIKE_COLORS[0] // Fallback su Slate
}