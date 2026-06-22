import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthScreen } from "@/components/auth-screen";
import { ProposalForm } from "@/components/proposal-form";
import { HistoryList } from "@/components/history-list";
import { BrandSettings } from "@/components/brand-settings";
import { RkLogo } from "@/components/rk-logo";
import type { BrandSettingsRow, ProposalRow } from "@/lib/types";
import { downloadBlob, generateProposalPdf } from "@/lib/pdf";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Quadro — RK Films" },
      { name: "description", content: "Gerador de propostas comerciais da RK Films." },
    ],
  }),
  component: Index,
});

type Tab = "novo" | "historico" | "marca";

function Index() {
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [userEmail, setUserEmail] = useState<string>("");
  const [tab, setTab] = useState<Tab>("novo");
  const [proposals, setProposals] = useState<ProposalRow[]>([]);
  const [brand, setBrand] = useState<BrandSettingsRow | null>(null);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [editing, setEditing] = useState<ProposalRow | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Auth subscription
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUserId(data.session?.user.id ?? null);
      setUserEmail(data.session?.user.email ?? "");
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user.id ?? null);
      setUserEmail(session?.user.email ?? "");
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Load data when signed in
  useEffect(() => {
    if (!userId) return;
    void reloadProposals();
    void loadBrand();
  }, [userId]);

  const reloadProposals = useCallback(async () => {
    setLoadingProposals(true);
    const { data, error } = await (supabase as any)
      .from("proposals")
      .select("*")
      .order("created_at", { ascending: false });
    setLoadingProposals(false);
    if (error) {
      console.error(error);
      return;
    }
    setProposals((data || []) as ProposalRow[]);
  }, []);

  const loadBrand = useCallback(async () => {
    const { data } = await (supabase as any)
      .from("brand_settings")
      .select("*")
      .maybeSingle();
    setBrand(data as BrandSettingsRow | null);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  };

  if (userId === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="text-muted-foreground text-sm">Carregando…</span>
      </div>
    );
  }
  if (userId === null) {
    return <AuthScreen />;
  }

  async function saveProposal(state: any): Promise<ProposalRow | null> {
    const payload = {
      user_id: userId,
      client_name: state.client_name,
      company: state.company,
      email: state.email,
      phone: state.phone,
      service_type: state.service_type,
      project_date: state.project_date,
      project_title: state.project_title,
      project_description: state.project_description,
      items: state.items,
      validity_days: state.validity_days,
      payment_terms: state.payment_terms,
      notes: state.notes,
      total: state.total,
    };
    let row: ProposalRow | null = null;
    if (editing) {
      const { data, error } = await (supabase as any)
        .from("proposals")
        .update(payload)
        .eq("id", editing.id)
        .select()
        .single();
      if (error) {
        alert(error.message);
        return null;
      }
      row = data as ProposalRow;
      setEditing(row);
    } else {
      const { data, error } = await (supabase as any)
        .from("proposals")
        .insert(payload)
        .select()
        .single();
      if (error) {
        alert(error.message);
        return null;
      }
      row = data as ProposalRow;
      setEditing(row);
    }
    await reloadProposals();
    showToast("Proposta salva.");
    return row;
  }

  async function generatePdfFor(row: ProposalRow) {
    if (!brand) {
      alert(
        "Configure a identidade da marca antes de gerar o PDF (aba 'Identidade da marca').",
      );
      return;
    }
    const blob = await generateProposalPdf(row, brand);
    const num = String(row.sequence_number).padStart(4, "0");
    const slug =
      (row.client_name || row.project_title || "proposta")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .toLowerCase() || "proposta";
    downloadBlob(blob, `RK-Films-Proposta-${num}-${slug}.pdf`);
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-12">
      <Header
        email={userEmail}
        tab={tab}
        onTab={setTab}
        onSignOut={async () => {
          await supabase.auth.signOut();
          setEditing(null);
        }}
      />

      <main className="max-w-5xl mx-auto px-4 md:px-6 pt-6">
        {tab === "novo" && (
          <div className="anim-tab-enter">
            <ProposalForm
              initial={editing}
              onSave={async (state) => {
                await saveProposal(state);
              }}
              onGeneratePdf={async (state) => {
                const row = await saveProposal(state);
                if (row) await generatePdfFor(row);
              }}
              onClear={() => setEditing(null)}
            />
          </div>
        )}

        {tab === "historico" && (
          <div className="anim-tab-enter">
            <HistoryList
              rows={proposals}
              loading={loadingProposals}
              onOpen={(p) => {
                setEditing(p);
                setTab("novo");
              }}
              onDuplicate={async (p) => {
                const { id, sequence_number, created_at, updated_at, ...rest } = p as any;
                void id; void sequence_number; void created_at; void updated_at;
                const { data, error } = await (supabase as any)
                  .from("proposals")
                  .insert({ ...rest, project_title: `${p.project_title} (cópia)` })
                  .select()
                  .single();
                if (error) return alert(error.message);
                await reloadProposals();
                setEditing(data as ProposalRow);
                setTab("novo");
                showToast("Proposta duplicada.");
              }}
              onPdf={generatePdfFor}
              onDelete={async (p) => {
                if (!confirm(`Excluir proposta Nº ${String(p.sequence_number).padStart(4, "0")}?`)) return;
                const { error } = await (supabase as any).from("proposals").delete().eq("id", p.id);
                if (error) return alert(error.message);
                if (editing?.id === p.id) setEditing(null);
                await reloadProposals();
              }}
            />
          </div>
        )}

        {tab === "marca" && (
          <div className="anim-tab-enter">
            <BrandSettings
              value={brand}
              onSave={async (next) => {
                const { updated_at, ...rest } = next;
                void updated_at;
                const payload = { ...rest, user_id: userId };
                const { error } = await (supabase as any)
                  .from("brand_settings")
                  .upsert(payload, { onConflict: "user_id" });
                if (error) return alert(error.message);
                await loadBrand();
                showToast("Identidade salva.");
              }}
            />
          </div>
        )}
      </main>

      {toast && (
        <div className="anim-toast fixed bottom-6 left-1/2 -translate-x-1/2 bg-[var(--panel-2)] border border-[var(--gold)]/50 text-foreground text-sm px-4 py-2 rounded-md shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

function Header({
  email,
  tab,
  onTab,
  onSignOut,
}: {
  email: string;
  tab: Tab;
  onTab: (t: Tab) => void;
  onSignOut: () => void;
}) {
  const tabs: Array<{ id: Tab; label: string }> = [
    { id: "novo", label: "Nova proposta" },
    { id: "historico", label: "Histórico" },
    { id: "marca", label: "Identidade da marca" },
  ];

  const navRef = useRef<HTMLElement>(null);
  const [ind, setInd] = useState({ left: 0, width: 0, visible: false });

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const btn = nav.querySelector<HTMLElement>(`[data-tab="${tab}"]`);
    if (!btn) return;
    const navRect = nav.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    setInd({
      left: btnRect.left - navRect.left + 8,
      width: btnRect.width - 16,
      visible: true,
    });
  }, [tab]);

  return (
    <header className="border-b border-border bg-[var(--panel)]/40 backdrop-blur sticky top-0 z-20">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-3 flex items-center gap-3">
        <RkLogo size={28} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-foreground font-semibold tracking-tight">Quadro</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hidden sm:inline">
              RK Films
            </span>
          </div>
        </div>
        <details className="relative">
          <summary className="list-none cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors duration-150">
            {email || "Conta"}
          </summary>
          <div className="anim-dropdown absolute right-0 mt-2 w-44 bg-[var(--panel-2)] border border-border rounded shadow-lg p-1 z-30">
            <button
              type="button"
              onClick={onSignOut}
              className="w-full text-left text-xs px-3 py-2 hover:bg-[var(--panel)] rounded text-foreground transition-colors duration-150"
            >
              Sair
            </button>
          </div>
        </details>
      </div>
      <nav ref={navRef} className="relative max-w-5xl mx-auto px-2 md:px-4 flex gap-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            data-tab={t.id}
            type="button"
            onClick={() => onTab(t.id)}
            className={`px-3 md:px-4 py-2.5 text-xs md:text-sm whitespace-nowrap transition-colors duration-200 ${
              tab === t.id
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
        {/* single gold indicator that slides between tabs */}
        <span
          className="pointer-events-none absolute bottom-0 h-px bg-[var(--gold)]"
          style={{
            left: ind.left,
            width: ind.width,
            opacity: ind.visible ? 1 : 0,
            transition: "left 0.28s cubic-bezier(0.4,0,0.2,1), width 0.28s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      </nav>
    </header>
  );
}
