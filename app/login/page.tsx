import { login, signup } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gauge, AlertCircle } from "lucide-react";
import { Suspense } from "react";

// 1. Creiamo un componente isolato che legge i parametri URL
async function LoginMessage({ searchParams }: { searchParams: Promise<{ message: string }> }) {
  // L'await viene fatto QUI, non bloccando il resto della pagina
  const { message } = await searchParams;

  if (!message) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 p-3 rounded-lg animate-in fade-in slide-in-from-top-1">
      <AlertCircle size={16} />
      {message}
    </div>
  );
}

// 2. La Pagina Principale (rimane statica e veloce)
export default function LoginPage(props: {
  searchParams: Promise<{ message: string }>;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 transition-colors">
      
      {/* Branding */}
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="bg-slate-900 dark:bg-green-900/20 text-white dark:text-green-400 p-3 rounded-2xl shadow-lg">
          <Gauge size={40} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          SagManager
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Track Day & Setup Organizer
        </p>
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-sm border-slate-200 dark:border-slate-800 dark:bg-slate-900 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl dark:text-white">Benvenuto</CardTitle>
          <CardDescription>Accedi al tuo garage digitale</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nome@esempio.com"
                required
                className="dark:bg-slate-950 dark:border-slate-700"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="dark:bg-slate-950 dark:border-slate-700"
              />
            </div>

            {/* 3. Avvolgiamo il componente del messaggio in Suspense */}
            <Suspense fallback={<div className="h-10" />}>
              <LoginMessage searchParams={props.searchParams} />
            </Suspense>

            <div className="pt-2 flex flex-col gap-2">
              <Button formAction={login} className="w-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-green-600 dark:hover:bg-green-700">
                Accedi
              </Button>
              <Button formAction={signup} variant="ghost" className="w-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                Registrati
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}