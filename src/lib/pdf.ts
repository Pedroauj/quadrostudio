import jsPDF from "jspdf";
import { formatCurrency, formatDateBR } from "./format";
import type { BrandSettingsRow, ProposalRow } from "./types";

// Theme — mirrors the in-app dark/gold look.
const BG = "#131315";
const PANEL = "#1B1B1D";
const PANEL2 = "#222224";
const BORDER = "#333335";
const TEXT = "#EDEAE3";
const MUTED = "#8C8980";
const GOLD = "#B9A36C";

const PAGE_W = 210; // mm A4
const PAGE_H = 297;
const MARGIN = 16;

function fillBg(doc: jsPDF) {
  doc.setFillColor(BG);
  doc.rect(0, 0, PAGE_W, PAGE_H, "F");
}

function header(doc: jsPDF, brand: BrandSettingsRow) {
  // small logo top-left + Quadro wordmark
  if (brand.logo_url) {
    try {
      const props = doc.getImageProperties(brand.logo_url);
      const ratio = props.width / props.height;
      const hLogoH = 12;
      const hLogoW = hLogoH * ratio;
      doc.addImage(brand.logo_url, "PNG", MARGIN, MARGIN - 4, hLogoW, hLogoH, undefined, "NONE");
    } catch {}
  } else {
    doc.setDrawColor(GOLD);
    doc.setLineWidth(0.3);
    doc.circle(MARGIN + 5, MARGIN + 1, 4.5);
    doc.setTextColor(GOLD);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text("RK", MARGIN + 5, MARGIN + 2.4, { align: "center" });
  }
  doc.setTextColor(MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("QUADRO  ·  RK FILMS", MARGIN + 14, MARGIN + 2);

  doc.setDrawColor(BORDER);
  doc.setLineWidth(0.1);
  doc.line(MARGIN, MARGIN + 8, PAGE_W - MARGIN, MARGIN + 8);
}

function footer(doc: jsPDF, pageLabel: string) {
  doc.setDrawColor(BORDER);
  doc.setLineWidth(0.1);
  doc.line(MARGIN, PAGE_H - 14, PAGE_W - MARGIN, PAGE_H - 14);
  doc.setTextColor(MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("RK FILMS  ·  PROPOSTA COMERCIAL", MARGIN, PAGE_H - 9);
  doc.text(pageLabel, PAGE_W - MARGIN, PAGE_H - 9, { align: "right" });
}

function drawCover(doc: jsPDF, p: ProposalRow, brand: BrandSettingsRow) {
  fillBg(doc);
  // Cover image
  if (brand.cover_url) {
    try {
      doc.addImage(brand.cover_url, "JPEG", 0, 0, PAGE_W, PAGE_H, undefined, "NONE");
    } catch {}
  }
  // Heavy dark veil
  doc.setFillColor(0, 0, 0);
  doc.setGState(new (doc as any).GState({ opacity: 0.78 }));
  doc.rect(0, 0, PAGE_W, PAGE_H, "F");
  doc.setGState(new (doc as any).GState({ opacity: 1 }));

  // Top thin gold rule
  doc.setDrawColor(GOLD);
  doc.setLineWidth(0.4);
  doc.line(PAGE_W / 2 - 14, 30, PAGE_W / 2 + 14, 30);

  // Establishment line
  doc.setTextColor(GOLD);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(brand.establishment || "EST. — RK FILMS", PAGE_W / 2, 36, { align: "center" });

  // Logo (centered, large, aspect-ratio-correct)
  if (brand.logo_url) {
    try {
      const props = doc.getImageProperties(brand.logo_url);
      const maxLogoSize = 90; // mm — big and prominent on cover
      const ratio = props.width / props.height;
      const logoW = ratio >= 1 ? maxLogoSize : maxLogoSize * ratio;
      const logoH = ratio >= 1 ? maxLogoSize / ratio : maxLogoSize;
      const logoX = PAGE_W / 2 - logoW / 2;
      const logoY = PAGE_H / 2 - logoH / 2 - 15;
      doc.addImage(brand.logo_url, "PNG", logoX, logoY, logoW, logoH, undefined, "NONE");
    } catch {}
  } else {
    doc.setDrawColor(GOLD);
    doc.setLineWidth(0.6);
    doc.circle(PAGE_W / 2, PAGE_H / 2 - 22, 22);
    doc.setTextColor(GOLD);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(36);
    doc.text("RK", PAGE_W / 2, PAGE_H / 2 - 16, { align: "center" });
  }

  // Tagline (serif feel via "times")
  if (brand.tagline) {
    doc.setTextColor(TEXT);
    doc.setFont("times", "italic");
    doc.setFontSize(15);
    const lines = doc.splitTextToSize(brand.tagline, PAGE_W - MARGIN * 4);
    doc.text(lines, PAGE_W / 2, PAGE_H / 2 + 10, { align: "center" });
  }

  // Footer block on cover
  const fy = PAGE_H - 36;
  doc.setDrawColor(GOLD);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, fy, PAGE_W - MARGIN, fy);
  doc.setTextColor(GOLD);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("PROPOSTA COMERCIAL", MARGIN, fy + 6);
  doc.text(`Nº ${String(p.sequence_number).padStart(4, "0")}`, PAGE_W - MARGIN, fy + 6, {
    align: "right",
  });

  doc.setTextColor(TEXT);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(p.client_name || "—", MARGIN, fy + 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(MUTED);
  const meta = `${p.service_type}  ·  ${p.project_date ? formatDateBR(p.project_date) : "Data a definir"}`;
  doc.text(meta, MARGIN, fy + 20);
}

function drawAbout(doc: jsPDF, brand: BrandSettingsRow) {
  fillBg(doc);
  header(doc, brand);

  doc.setTextColor(GOLD);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("01  ·  SOBRE NÓS", MARGIN, 40);

  doc.setTextColor(TEXT);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("Sobre nós", MARGIN, 52);

  doc.setDrawColor(GOLD);
  doc.setLineWidth(0.4);
  doc.line(MARGIN, 56, MARGIN + 18, 56);

  doc.setTextColor(TEXT);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const text = brand.about_text || "Adicione um texto institucional nas configurações de identidade da marca.";
  const lines = doc.splitTextToSize(text, PAGE_W - MARGIN * 2);
  doc.text(lines, MARGIN, 68, { lineHeightFactor: 1.65 });

  footer(doc, "01 / SOBRE NÓS");
}

function drawPortfolio(doc: jsPDF, brand: BrandSettingsRow) {
  const photos = brand.portfolio_urls || [];
  if (!photos.length) return;

  // 2x2 grid per page
  const cols = 2;
  const rows = 2;
  const perPage = cols * rows;
  const gap = 4;
  const usableW = PAGE_W - MARGIN * 2;
  const cellW = (usableW - gap * (cols - 1)) / cols;
  const usableH = PAGE_H - 80;
  const cellH = (usableH - gap * (rows - 1)) / rows;

  for (let i = 0; i < photos.length; i += perPage) {
    doc.addPage();
    fillBg(doc);
    header(doc, brand);

    doc.setTextColor(GOLD);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("02  ·  PORTFÓLIO", MARGIN, 40);
    doc.setTextColor(TEXT);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("Portfólio", MARGIN, 52);
    doc.setDrawColor(GOLD);
    doc.setLineWidth(0.4);
    doc.line(MARGIN, 56, MARGIN + 18, 56);

    const slice = photos.slice(i, i + perPage);
    slice.forEach((url, idx) => {
      const c = idx % cols;
      const r = Math.floor(idx / cols);
      const x = MARGIN + c * (cellW + gap);
      const y = 64 + r * (cellH + gap);
      doc.setFillColor(PANEL);
      doc.rect(x, y, cellW, cellH, "F");
      try {
        doc.addImage(url, "JPEG", x, y, cellW, cellH, undefined, "NONE");
      } catch {}
      doc.setDrawColor(BORDER);
      doc.setLineWidth(0.1);
      doc.rect(x, y, cellW, cellH, "S");
    });

    footer(doc, "02 / PORTFÓLIO");
  }
}

function ensureSpace(doc: jsPDF, y: number, needed: number, brand: BrandSettingsRow): number {
  if (y + needed > PAGE_H - 20) {
    footer(doc, "03 / PROPOSTA");
    doc.addPage();
    fillBg(doc);
    header(doc, brand);
    return 40;
  }
  return y;
}

function drawProposal(doc: jsPDF, p: ProposalRow, brand: BrandSettingsRow) {
  doc.addPage();
  fillBg(doc);
  header(doc, brand);

  doc.setTextColor(GOLD);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("03  ·  PROPOSTA", MARGIN, 40);
  doc.setTextColor(TEXT);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(p.project_title || "Proposta", MARGIN, 52);
  doc.setDrawColor(GOLD);
  doc.setLineWidth(0.4);
  doc.line(MARGIN, 56, MARGIN + 18, 56);

  // Client / Project columns
  let y = 66;
  const colW = (PAGE_W - MARGIN * 2 - 6) / 2;

  const drawBlock = (x: number, label: string, lines: Array<[string, string]>) => {
    doc.setFillColor(PANEL);
    doc.rect(x, y, colW, 44, "F");
    doc.setDrawColor(BORDER);
    doc.setLineWidth(0.1);
    doc.rect(x, y, colW, 44, "S");
    doc.setTextColor(GOLD);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text(label, x + 4, y + 6);
    doc.setTextColor(TEXT);
    doc.setFontSize(9);
    let yy = y + 12;
    lines.forEach(([k, v]) => {
      doc.setTextColor(MUTED);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.text(k.toUpperCase(), x + 4, yy);
      doc.setTextColor(TEXT);
      doc.setFontSize(9);
      const wrapped = doc.splitTextToSize(v || "—", colW - 8);
      doc.text(wrapped[0] || "—", x + 4, yy + 4);
      yy += 9;
    });
  };

  drawBlock(MARGIN, "CLIENTE", [
    ["Contato", p.client_name],
    ["Empresa", p.company],
    ["E-mail", p.email],
    ["Telefone", p.phone],
  ]);
  drawBlock(MARGIN + colW + 6, "PROJETO", [
    ["Tipo", p.service_type],
    ["Data prevista", p.project_date ? formatDateBR(p.project_date) : "—"],
    ["Título", p.project_title],
    ["Validade", `${p.validity_days} dias`],
  ]);
  y += 50;

  if (p.project_description) {
    doc.setTextColor(MUTED);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text("ESCOPO", MARGIN, y);
    doc.setTextColor(TEXT);
    doc.setFontSize(9.5);
    const desc = doc.splitTextToSize(p.project_description, PAGE_W - MARGIN * 2);
    doc.text(desc, MARGIN, y + 5, { lineHeightFactor: 1.5 });
    y += 5 + desc.length * 4.5 + 6;
  }

  // Items
  doc.setTextColor(MUTED);
  doc.setFontSize(7);
  doc.text("PACOTES & ITENS", MARGIN, y);
  y += 4;

  for (const item of p.items) {
    const descLines = item.description
      ? doc.splitTextToSize(item.description, PAGE_W - MARGIN * 2 - 8)
      : [];
    const h = 14 + descLines.length * 4;
    y = ensureSpace(doc, y, h + 4, brand);

    if (item.highlighted) {
      doc.setFillColor(PANEL2);
      doc.rect(MARGIN, y, PAGE_W - MARGIN * 2, h, "F");
      doc.setDrawColor(GOLD);
      doc.setLineWidth(0.4);
      doc.line(MARGIN, y, MARGIN, y + h);
    } else {
      doc.setFillColor(PANEL);
      doc.rect(MARGIN, y, PAGE_W - MARGIN * 2, h, "F");
    }
    doc.setDrawColor(BORDER);
    doc.setLineWidth(0.08);
    doc.rect(MARGIN, y, PAGE_W - MARGIN * 2, h, "S");

    doc.setTextColor(TEXT);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(item.name || "Item sem nome", MARGIN + 4, y + 6);

    doc.setTextColor(GOLD);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(formatCurrency(item.value), PAGE_W - MARGIN - 4, y + 6, { align: "right" });

    if (item.highlighted) {
      doc.setTextColor(GOLD);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.text("RECOMENDADO", MARGIN + 4, y + 11);
    }

    if (descLines.length) {
      doc.setTextColor(MUTED);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.text(descLines, MARGIN + 4, y + (item.highlighted ? 16 : 12), {
        lineHeightFactor: 1.4,
      });
    }

    y += h + 3;
  }

  // Total
  y = ensureSpace(doc, y, 24, brand);
  y += 3;
  doc.setFillColor(GOLD);
  doc.rect(MARGIN, y, PAGE_W - MARGIN * 2, 18, "F");
  doc.setTextColor("#131315");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("VALOR TOTAL", MARGIN + 4, y + 7);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(formatCurrency(p.total), PAGE_W - MARGIN - 4, y + 12, { align: "right" });
  y += 24;

  // Terms
  y = ensureSpace(doc, y, 30, brand);
  doc.setTextColor(MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("CONDIÇÕES & TERMOS", MARGIN, y);
  y += 5;
  doc.setTextColor(TEXT);
  doc.setFontSize(9);
  const terms: string[] = [];
  terms.push(`• Validade da proposta: ${p.validity_days} dias.`);
  if (p.payment_terms) terms.push(`• Pagamento: ${p.payment_terms}`);
  if (p.notes) terms.push(`• Observações: ${p.notes}`);
  for (const line of terms) {
    const wrapped = doc.splitTextToSize(line, PAGE_W - MARGIN * 2);
    y = ensureSpace(doc, y, wrapped.length * 4.5, brand);
    doc.text(wrapped, MARGIN, y, { lineHeightFactor: 1.5 });
    y += wrapped.length * 4.5 + 2;
  }

  footer(doc, "03 / PROPOSTA");
}

export async function generateProposalPdf(p: ProposalRow, brand: BrandSettingsRow): Promise<Blob> {
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: false });
  drawCover(doc, p, brand);
  doc.addPage();
  drawAbout(doc, brand);
  drawPortfolio(doc, brand);
  drawProposal(doc, p, brand);
  return doc.output("blob");
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}