import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { PreferencesProvider } from "@/components/preferences-provider"

const inter = Inter({ subsets: ["latin"] });

// 1. Configurazione Viewport
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Disabilita zoom per feel "App Nativa"
  themeColor: "#020617",
};

// 2. Configurazione Metadata e PWA
export const metadata: Metadata = {
  title: "SagManager",
  description: "Il tuo garage digitale per i setup da pista",
  manifest: "/manifest.webmanifest", 
  
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.png", 
  },
  
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SagManager",
  },
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
          <PreferencesProvider>
            {children}
            <Toaster position="top-center" />
          </PreferencesProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}