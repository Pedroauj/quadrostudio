import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RkLogo } from "./rk-logo";

export function AuthScreen() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao autenticar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-10">
          <RkLogo size={36} />
          <div>
            <div className="text-foreground text-lg font-semibold tracking-tight">Quadro</div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              RK Films · Propostas
            </div>
          </div>
        </div>

        <div className="rounded-md border border-border bg-card p-6">
          <h1 className="text-foreground text-base font-semibold mb-1">
            {mode === "signin" ? "Entrar" : "Criar conta"}
          </h1>
          <p className="text-muted-foreground text-sm mb-6">
            Acesso restrito à equipe RK Films.
          </p>

          <form onSubmit={submit} className="space-y-3">
            <Field label="E-mail">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-input border border-border rounded px-3 py-2 text-sm text-foreground"
                autoComplete="email"
              />
            </Field>
            <Field label="Senha">
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-input border border-border rounded px-3 py-2 text-sm text-foreground"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
              />
            </Field>

            {error && (
              <div className="text-xs text-destructive border border-destructive/40 bg-destructive/10 rounded px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 gold-gradient text-[#131315] font-medium text-sm rounded py-2.5 disabled:opacity-60"
            >
              {loading ? "Aguarde…" : mode === "signin" ? "Entrar" : "Criar conta"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setMode((m) => (m === "signin" ? "signup" : "signin"))}
            className="mt-4 w-full text-xs text-muted-foreground hover:text-foreground"
          >
            {mode === "signin" ? "Ainda não tem conta? Criar uma." : "Já tem conta? Entrar."}
          </button>
        </div>

        <p className="text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-8">
          EST. 2021 — SÃO PAULO
        </p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}