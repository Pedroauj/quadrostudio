import { formatCurrency, formatDateBR } from "@/lib/format";
import type { ProposalRow } from "@/lib/types";

interface Props {
  rows: ProposalRow[];
  loading: boolean;
  onOpen: (p: ProposalRow) => void;
  onDuplicate: (p: ProposalRow) => void;
  onPdf: (p: ProposalRow) => void;
  onDelete: (p: ProposalRow) => void;
}

export function HistoryList({ rows, loading, onOpen, onDuplicate, onPdf, onDelete }: Props) {
  if (loading) {
    return <div className="text-sm text-muted-foreground">Carregando…</div>;
  }
  if (!rows.length) {
    return (
      <div className="text-sm text-muted-foreground border border-dashed border-border rounded p-10 text-center">
        Nenhuma proposta salva ainda.
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {rows.map((p) => (
        <div
          key={p.id}
          className="rounded border border-border bg-card hover:border-[var(--gold)]/50 transition p-4 flex flex-col md:flex-row md:items-center gap-3"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <span className="font-mono text-[11px] tracking-widest text-[var(--gold)]">
                Nº {String(p.sequence_number).padStart(4, "0")}
              </span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {p.service_type}
              </span>
            </div>
            <div className="text-foreground text-sm font-medium truncate">
              {p.project_title || "Sem título"}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {p.client_name || "—"}
              {p.company ? ` · ${p.company}` : ""}
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 md:w-auto">
            <div className="text-right">
              <div className="font-mono text-sm text-[var(--gold)] tabular-nums">
                {formatCurrency(p.total)}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {formatDateBR(p.created_at)}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 md:ml-2">
            <ActionBtn onClick={() => onOpen(p)}>Abrir</ActionBtn>
            <ActionBtn onClick={() => onDuplicate(p)}>Duplicar</ActionBtn>
            <ActionBtn onClick={() => onPdf(p)}>PDF</ActionBtn>
            <ActionBtn destructive onClick={() => onDelete(p)}>
              Excluir
            </ActionBtn>
          </div>
        </div>
      ))}
    </div>
  );
}

function ActionBtn({
  children,
  onClick,
  destructive,
}: {
  children: React.ReactNode;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-xs px-2.5 py-1 rounded border transition ${
        destructive
          ? "border-destructive/30 text-destructive hover:border-destructive"
          : "border-border text-muted-foreground hover:text-foreground hover:border-[var(--gold)]/50"
      }`}
    >
      {children}
    </button>
  );
}