// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] });

// 1. Configurazione PWA e Icone
export const metadata: Metadata = {
  title: "SagManager",
  description: "Il tuo garage digitale per i setup da pista",
  manifest: "/manifest.json", 
  icons: {
    icon: "/icon.svg", 
    apple: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SagManager",
  },
};

// 2. Configurazione Viewport (Disabilita lo zoom su mobile per sembrare nativa)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f172a", // Colore barra di stato (Slate 900)
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-50 dark:bg-slate-950`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          {/* Componente per le notifiche (Sonner) */}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}