// Currency / phone formatting helpers — work with raw digit strings to keep mask logic predictable.

export function onlyDigits(v: string): string {
  return v.replace(/\D+/g, "");
}

/** Mask BR phone: (00) 00000-0000, max 11 digits. */
export function maskPhone(input: string): string {
  const d = onlyDigits(input).slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Currency mask: digits-only -> "R$ 1.234,56". Operates in cents. */
export function maskCurrency(input: string): string {
  const d = onlyDigits(input);
  if (!d) return "";
  const cents = parseInt(d, 10);
  return formatCurrency(cents / 100);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);
}

export function parseCurrency(masked: string): number {
  const d = onlyDigits(masked);
  if (!d) return 0;
  return parseInt(d, 10) / 100;
}

export function formatDateBR(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}