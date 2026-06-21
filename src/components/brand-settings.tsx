import { useState } from "react";
import { compressImage } from "@/lib/image";
import type { BrandSettingsRow } from "@/lib/types";

interface Props {
  value: BrandSettingsRow | null;
  onSave: (next: BrandSettingsRow) => Promise<void>;
}

const DEFAULT: BrandSettingsRow = {
  user_id: "",
  logo_url: null,
  cover_url: null,
  establishment: "EST. 2021 — SÃO PAULO",
  tagline: "",
  about_text: "",
  portfolio_urls: [],
  updated_at: "",
};

export function BrandSettings({ value, onSave }: Props) {
  const [state, setState] = useState<BrandSettingsRow>(value || DEFAULT);
  const [busy, setBusy] = useState<string | null>(null);

  const set = <K extends keyof BrandSettingsRow>(k: K, v: BrandSettingsRow[K]) =>
    setState((s) => ({ ...s, [k]: v }));

  async function handleLogo(file: File | null) {
    if (!file) return;
    setBusy("Comprimindo logo…");
    try {
      const data = await compressImage(file, { maxW: 512, maxH: 512, mime: "image/png", quality: 1 });
      set("logo_url", data);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro");
    } finally {
      setBusy(null);
    }
  }

  async function handleCover(file: File | null) {
    if (!file) return;
    setBusy("Comprimindo capa…");
    try {
      const data = await compressImage(file, { maxW: 1600, maxH: 2400, quality: 0.78 });
      set("cover_url", data);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro");
    } finally {
      setBusy(null);
    }
  }

  async function handlePortfolio(files: FileList | null) {
    if (!files || !files.length) return;
    setBusy("Comprimindo portfólio…");
    try {
      const remaining = 6 - state.portfolio_urls.length;
      const arr = Array.from(files).slice(0, remaining);
      const out: string[] = [];
      for (const f of arr) {
        out.push(await compressImage(f, { maxW: 1400, maxH: 1400, quality: 0.78 }));
      }
      set("portfolio_urls", [...state.portfolio_urls, ...out].slice(0, 6));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro");
    } finally {
      setBusy(null);
    }
  }

  function removePortfolio(idx: number) {
    set("portfolio_urls", state.portfolio_urls.filter((_, i) => i !== idx));
  }

  async function save() {
    setBusy("Salvando…");
    try {
      await onSave(state);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-5">
      <Section title="Marca" index="01">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FilePreview
            label="Logo (PNG transparente)"
            preview={state.logo_url}
            onPick={handleLogo}
            onClear={() => set("logo_url", null)}
            accept="image/png,image/jpeg"
            previewBg="#0e0e10"
            aspect="aspect-square"
          />
          <FilePreview
            label="Imagem de capa"
            preview={state.cover_url}
            onPick={handleCover}
            onClear={() => set("cover_url", null)}
            accept="image/jpeg,image/png"
            previewBg="#0e0e10"
            aspect="aspect-[3/4]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          <Field label="Linha de estabelecimento">
            <input
              value={state.establishment}
              onChange={(e) => set("establishment", e.target.value)}
              className="w-full bg-input border border-border rounded px-3 py-2 text-sm text-foreground"
            />
          </Field>
          <Field label="Tagline (frase de impacto)">
            <input
              value={state.tagline}
              onChange={(e) => set("tagline", e.target.value)}
              className="w-full bg-input border border-border rounded px-3 py-2 text-sm text-foreground"
            />
          </Field>
        </div>
      </Section>

      <Section title="Sobre nós" index="02">
        <textarea
          value={state.about_text}
          onChange={(e) => set("about_text", e.target.value)}
          rows={8}
          className="w-full bg-input border border-border rounded px-3 py-2 text-sm text-foreground resize-y"
          placeholder="Texto que aparecerá na segunda página de toda proposta."
        />
      </Section>

      <Section
        title="Portfólio"
        index="03"
        action={
          <span className="text-xs text-muted-foreground">
            {state.portfolio_urls.length}/6
          </span>
        }
      >
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {state.portfolio_urls.map((url, i) => (
            <div key={i} className="relative group aspect-square rounded overflow-hidden border border-border bg-[#0e0e10]">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removePortfolio(i)}
                className="absolute top-1.5 right-1.5 text-[10px] bg-black/70 text-foreground border border-border rounded px-2 py-0.5 opacity-0 group-hover:opacity-100 transition"
              >
                remover
              </button>
            </div>
          ))}
          {state.portfolio_urls.length < 6 && (
            <label className="aspect-square rounded border border-dashed border-border flex items-center justify-center text-xs text-muted-foreground hover:border-[var(--gold)]/60 hover:text-foreground cursor-pointer">
              + adicionar
              <input
                type="file"
                accept="image/jpeg,image/png"
                multiple
                className="hidden"
                onChange={(e) => handlePortfolio(e.target.files)}
              />
            </label>
          )}
        </div>
      </Section>

      <div className="flex justify-end items-center gap-3">
        {busy && <span className="text-xs text-muted-foreground">{busy}</span>}
        <button
          onClick={save}
          className="px-4 py-2 text-sm rounded gold-gradient text-[#131315] font-medium"
        >
          Salvar identidade da marca
        </button>
      </div>
    </div>
  );
}

function Section({
  title,
  index,
  action,
  children,
}: {
  title: string;
  index: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-md border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[10px] tracking-widest text-[var(--gold)]">{index}</span>
          <h2 className="text-foreground text-sm font-semibold tracking-wide uppercase">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
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

function FilePreview({
  label,
  preview,
  onPick,
  onClear,
  accept,
  previewBg,
  aspect,
}: {
  label: string;
  preview: string | null;
  onPick: (f: File | null) => void;
  onClear: () => void;
  accept: string;
  previewBg: string;
  aspect: string;
}) {
  return (
    <div>
      <span className="block text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1.5">
        {label}
      </span>
      <div
        className={`${aspect} rounded border border-border overflow-hidden flex items-center justify-center`}
        style={{ background: previewBg }}
      >
        {preview ? (
          <img src={preview} alt="" className="w-full h-full object-contain" />
        ) : (
          <span className="text-xs text-muted-foreground">Sem imagem</span>
        )}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <label className="text-xs px-3 py-1.5 rounded border border-border hover:border-[var(--gold)]/60 cursor-pointer">
          {preview ? "Substituir" : "Enviar"}
          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => onPick(e.target.files?.[0] || null)}
          />
        </label>
        {preview && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs px-3 py-1.5 rounded border border-border text-muted-foreground hover:text-destructive hover:border-destructive/50"
          >
            Remover
          </button>
        )}
      </div>
    </div>
  );
}