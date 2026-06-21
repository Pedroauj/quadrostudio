import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { maskCurrency, maskPhone, parseCurrency, formatCurrency } from "@/lib/format";
import type { ProposalItem, ProposalRow, ServiceType } from "@/lib/types";
import { EMPTY_PROPOSAL } from "@/lib/types";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

type FormState = Omit<
  ProposalRow,
  "id" | "user_id" | "sequence_number" | "created_at" | "updated_at" | "total"
>;

export interface ProposalFormHandle {
  getState: () => FormState & { total: number };
  reset: () => void;
  loadFrom: (p: ProposalRow) => void;
}

interface Props {
  initial?: ProposalRow | null;
  onSave: (state: FormState & { total: number }) => Promise<void>;
  onGeneratePdf: (state: FormState & { total: number }) => Promise<void>;
  onClear: () => void;
}

export function ProposalForm({ initial, onSave, onGeneratePdf, onClear }: Props) {
  const [state, setState] = useState<FormState>(() => fromInitial(initial));
  const [savingLabel, setSavingLabel] = useState<string | null>(null);

  useEffect(() => {
    setState(fromInitial(initial));
  }, [initial?.id]);

  const total = useMemo(
    () => state.items.reduce((sum, it) => sum + (it.value || 0), 0),
    [state.items],
  );

  // Field updaters — keep stable per-field
  const set = useCallback(<K extends keyof FormState>(k: K, v: FormState[K]) => {
    setState((s) => ({ ...s, [k]: v }));
  }, []);

  const updateItem = useCallback((id: string, patch: Partial<ProposalItem>) => {
    setState((s) => ({
      ...s,
      items: s.items.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    }));
  }, []);

  const removeItem = useCallback((id: string) => {
    setState((s) => ({ ...s, items: s.items.filter((it) => it.id !== id) }));
  }, []);

  const addItem = useCallback(() => {
    setState((s) => ({
      ...s,
      items: [
        ...s.items,
        { id: uid(), name: "", description: "", value: 0, highlighted: false },
      ],
    }));
  }, []);

  const handleSave = async () => {
    setSavingLabel("Salvando…");
    try {
      await onSave({ ...state, total });
    } finally {
      setSavingLabel(null);
    }
  };
  const handlePdf = async () => {
    setSavingLabel("Gerando PDF…");
    try {
      await onGeneratePdf({ ...state, total });
    } finally {
      setSavingLabel(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Cliente */}
      <Section title="Cliente" index="01">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Contato">
            <Input value={state.client_name} onChange={(v) => set("client_name", v)} />
          </Field>
          <Field label="Empresa / Marca">
            <Input value={state.company} onChange={(v) => set("company", v)} />
          </Field>
          <Field label="E-mail">
            <Input type="email" value={state.email} onChange={(v) => set("email", v)} />
          </Field>
          <Field label="Telefone">
            <Input
              value={state.phone}
              onChange={(v) => set("phone", maskPhone(v))}
              placeholder="(00) 00000-0000"
              inputMode="numeric"
            />
          </Field>
        </div>
      </Section>

      {/* Projeto */}
      <Section title="Projeto" index="02">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Tipo de serviço">
            <Select
              value={state.service_type}
              onChange={(v) => set("service_type", v as ServiceType)}
              options={["Filmagem", "Fotografia", "Filmagem + Fotografia"]}
            />
          </Field>
          <Field label="Data prevista">
            <Input type="date" value={state.project_date} onChange={(v) => set("project_date", v)} />
          </Field>
          <Field label="Título do projeto" full>
            <Input value={state.project_title} onChange={(v) => set("project_title", v)} />
          </Field>
          <Field label="Descrição do escopo" full>
            <Textarea
              value={state.project_description}
              onChange={(v) => set("project_description", v)}
              rows={4}
            />
          </Field>
        </div>
      </Section>

      {/* Pacotes & itens */}
      <Section
        title="Pacotes & itens"
        index="03"
        action={
          <button
            type="button"
            onClick={addItem}
            className="text-xs px-3 py-1.5 rounded border border-border hover:border-[var(--gold)] text-foreground"
          >
            + Adicionar item
          </button>
        }
      >
        {state.items.length === 0 ? (
          <div className="text-sm text-muted-foreground border border-dashed border-border rounded p-6 text-center">
            Nenhum item ainda. Clique em <span className="text-foreground">"Adicionar item"</span>.
          </div>
        ) : (
          <div className="space-y-2.5">
            {state.items.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                onUpdate={updateItem}
                onRemove={removeItem}
              />
            ))}
          </div>
        )}
        <TotalDisplay total={total} />
      </Section>

      {/* Termos */}
      <Section title="Termos" index="04">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Validade (dias)">
            <Input
              type="number"
              value={String(state.validity_days)}
              onChange={(v) => set("validity_days", Math.max(1, parseInt(v || "0", 10) || 1))}
            />
          </Field>
          <Field label="Condições de pagamento" full>
            <Textarea
              value={state.payment_terms}
              onChange={(v) => set("payment_terms", v)}
              rows={2}
            />
          </Field>
          <Field label="Observações" full>
            <Textarea value={state.notes} onChange={(v) => set("notes", v)} rows={3} />
          </Field>
        </div>
      </Section>

      {/* Actions */}
      <div className="sticky bottom-0 -mx-4 px-4 py-4 bg-background/95 backdrop-blur border-t border-border md:static md:mx-0 md:px-0 md:bg-transparent md:backdrop-blur-none md:border-0">
        <div className="flex flex-wrap gap-2 justify-end items-center">
          {savingLabel && (
            <span className="text-xs text-muted-foreground mr-auto">{savingLabel}</span>
          )}
          <button
            type="button"
            onClick={() => {
              if (confirm("Limpar formulário?")) {
                setState(fromInitial(null));
                onClear();
              }
            }}
            className="px-4 py-2 text-sm rounded border border-border text-muted-foreground hover:text-foreground"
          >
            Limpar / nova
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 text-sm rounded border border-border text-foreground hover:border-[var(--gold)]"
          >
            Salvar proposta
          </button>
          <button
            type="button"
            onClick={handlePdf}
            className="px-4 py-2 text-sm rounded gold-gradient text-[#131315] font-medium"
          >
            Gerar PDF
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Item row (memoized to avoid re-render across siblings) ---------- */
const ItemRow = memo(function ItemRow({
  item,
  onUpdate,
  onRemove,
}: {
  item: ProposalItem;
  onUpdate: (id: string, patch: Partial<ProposalItem>) => void;
  onRemove: (id: string) => void;
}) {
  const [valueText, setValueText] = useState(() =>
    item.value ? formatCurrency(item.value) : "",
  );
  // keep local mask synced if item changes externally (e.g. load proposal)
  const lastValueRef = useRef(item.value);
  useEffect(() => {
    if (item.value !== lastValueRef.current) {
      lastValueRef.current = item.value;
      setValueText(item.value ? formatCurrency(item.value) : "");
    }
  }, [item.value]);

  return (
    <div
      className={`relative rounded border bg-[var(--panel)] p-3 transition ${
        item.highlighted
          ? "border-[var(--gold)] ring-gold-soft bg-[var(--panel-2)]"
          : "border-border"
      }`}
    >
      {item.highlighted && (
        <span className="absolute -top-2 left-3 text-[9px] uppercase tracking-[0.18em] bg-[var(--gold)] text-[#131315] px-1.5 py-0.5 rounded-sm font-medium">
          Recomendado
        </span>
      )}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
        <div className="space-y-2">
          <Input
            placeholder="Nome do item / pacote"
            value={item.name}
            onChange={(v) => onUpdate(item.id, { name: v })}
          />
          <Textarea
            placeholder="Descrição do que está incluído"
            value={item.description}
            onChange={(v) => onUpdate(item.id, { description: v })}
            rows={2}
          />
        </div>
        <div className="flex md:flex-col items-stretch gap-2 md:w-44">
          <Input
            placeholder="R$ 0,00"
            value={valueText}
            inputMode="numeric"
            onChange={(v) => {
              const masked = maskCurrency(v);
              setValueText(masked);
              const parsed = parseCurrency(masked);
              lastValueRef.current = parsed;
              onUpdate(item.id, { value: parsed });
            }}
          />
          <label className="flex items-center gap-2 text-xs text-muted-foreground select-none px-1">
            <input
              type="checkbox"
              checked={item.highlighted}
              onChange={(e) => onUpdate(item.id, { highlighted: e.target.checked })}
              className="accent-[var(--gold)]"
            />
            Destacar
          </label>
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="text-xs text-destructive border border-destructive/30 hover:border-destructive rounded px-2 py-1.5"
          >
            Remover
          </button>
        </div>
      </div>
    </div>
  );
});

function TotalDisplay({ total }: { total: number }) {
  return (
    <div className="mt-4 flex items-center justify-between rounded border border-[var(--gold)]/40 bg-[var(--panel-2)] px-4 py-3">
      <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        Valor total
      </span>
      <span className="font-mono text-lg font-semibold text-[var(--gold)] tabular-nums">
        {formatCurrency(total)}
      </span>
    </div>
  );
}

/* ---------- Layout primitives ---------- */
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
          <span className="font-mono text-[10px] tracking-widest text-[var(--gold)]">
            {index}
          </span>
          <h2 className="text-foreground text-sm font-semibold tracking-wide uppercase">
            {title}
          </h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  full,
  children,
}: {
  label: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${full ? "md:col-span-2" : ""}`}>
      <span className="block text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}

function Input({
  value,
  onChange,
  ...rest
}: {
  value: string;
  onChange: (v: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-input border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60"
      {...rest}
    />
  );
}

function Textarea({
  value,
  onChange,
  ...rest
}: {
  value: string;
  onChange: (v: string) => void;
} & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange">) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-input border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 resize-y"
      {...rest}
    />
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-input border border-border rounded px-3 py-2 text-sm text-foreground"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function fromInitial(initial: ProposalRow | null | undefined): FormState {
  if (!initial) return { ...EMPTY_PROPOSAL, items: [] };
  return {
    client_name: initial.client_name,
    company: initial.company,
    email: initial.email,
    phone: initial.phone,
    service_type: initial.service_type,
    project_date: initial.project_date,
    project_title: initial.project_title,
    project_description: initial.project_description,
    items: initial.items || [],
    validity_days: initial.validity_days,
    payment_terms: initial.payment_terms,
    notes: initial.notes,
  };
}