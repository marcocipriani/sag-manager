import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { PreferencesProvider } from "@/components/preferences-provider"
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#020617",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://sagmanager.vercel.app"), 
  
  title: "SagManager",
  description: "Il tuo garage digitale per i setup da pista",
  
  icons: {
    icon: "/icon-192.png",
    shortcut: "/icon-192.png",
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
          <Suspense fallback={null}>
            <PreferencesProvider>
              {children}
              <Toaster position="top-center" />
            </PreferencesProvider>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}