import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SagManager',
    short_name: 'SagManager',
    description: 'Gestione professionale setup moto',
    start_url: '/',
    id: '/', // Importante per tracciare l'installazione
    display: 'standalone',
    background_color: '#020617', // Colore sfondo splash screen
    theme_color: '#020617', // Colore barra di stato
    orientation: 'portrait',
    prefer_related_applications: false,
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any' // Icona standard
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable' // Icona adattiva (Android)
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }
    ],
  }
}