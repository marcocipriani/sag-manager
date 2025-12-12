// src/lib/preferences.ts

export type FieldConfig = {
  label: string
  min: number
  max: number
  step: number
  unit: string
}

export type AppConfig = Record<string, FieldConfig>

// I valori di default se l'utente non ha toccato nulla
export const DEFAULT_CONFIG: AppConfig = {
  // GOMME
  tirePressF: { label: "Pressione Ant", min: 0, max: 5, step: 0.1, unit: "bar" },
  tirePressR: { label: "Pressione Post", min: 0, max: 5, step: 0.1, unit: "bar" },
  
  // FORCELLA
  forkComp: { label: "Compressione", min: 0, max: 40, step: 1, unit: "click" },
  forkReb: { label: "Rebound", min: 0, max: 40, step: 1, unit: "click" },
  forkPreload: { label: "Precarico", min: 0, max: 20, step: 1, unit: "giri" },
  forkSpring: { label: "Molla (K)", min: 5, max: 15, step: 0.5, unit: "N/mm" },
  forkOilLevel: { label: "Livello Olio", min: 80, max: 200, step: 5, unit: "mm" },
  forkHeight: { label: "Sfilamento", min: 0, max: 10, step: 1, unit: "tacche" },
  forkSagStatic: { label: "Sag Statico", min: 0, max: 100, step: 1, unit: "mm" },
  forkSagDynamic: { label: "Sag Dinamico", min: 0, max: 100, step: 1, unit: "mm" },

  // MONO
  shockComp: { label: "Compressione", min: 0, max: 40, step: 1, unit: "click" },
  shockReb: { label: "Rebound", min: 0, max: 40, step: 1, unit: "click" },
  shockPreload: { label: "Precarico", min: 0, max: 50, step: 1, unit: "mm" },
  shockSpring: { label: "Molla (K)", min: 50, max: 150, step: 5, unit: "N/mm" },
  shockLength: { label: "Interasse Mono", min: 200, max: 400, step: 1, unit: "mm" },
  shockSagStatic: { label: "Sag Statico", min: 0, max: 100, step: 1, unit: "mm" },
  shockSagDynamic: { label: "Sag Dinamico", min: 0, max: 100, step: 1, unit: "mm" },

  // GEOMETRIA
  wheelbase: { label: "Interasse Totale", min: 1000, max: 2000, step: 1, unit: "mm" },
  rake: { label: "Inclinazione", min: 15, max: 35, step: 0.1, unit: "deg" },
  trail: { label: "Avancorsa", min: 50, max: 150, step: 1, unit: "mm" },
}