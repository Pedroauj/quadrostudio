export type ServiceType = "Filmagem" | "Fotografia" | "Filmagem + Fotografia";

export interface ProposalItem {
  id: string;
  name: string;
  description: string;
  value: number; // BRL
  highlighted: boolean;
}

export interface ProposalRow {
  id: string;
  user_id: string;
  sequence_number: number;
  client_name: string;
  company: string;
  email: string;
  phone: string;
  service_type: ServiceType;
  project_date: string;
  project_title: string;
  project_description: string;
  items: ProposalItem[];
  validity_days: number;
  payment_terms: string;
  notes: string;
  total: number;
  created_at: string;
  updated_at: string;
}

export interface BrandSettingsRow {
  user_id: string;
  logo_url: string | null;
  cover_url: string | null;
  establishment: string;
  tagline: string;
  about_text: string;
  portfolio_urls: string[];
  updated_at: string;
}

export const EMPTY_PROPOSAL: Omit<
  ProposalRow,
  "id" | "user_id" | "sequence_number" | "created_at" | "updated_at" | "total"
> = {
  client_name: "",
  company: "",
  email: "",
  phone: "",
  service_type: "Filmagem",
  project_date: "",
  project_title: "",
  project_description: "",
  items: [],
  validity_days: 15,
  payment_terms: "50% na assinatura, 50% na entrega.",
  notes: "",
};