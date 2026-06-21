
-- proposals
CREATE TABLE public.proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  sequence_number INT NOT NULL,
  client_name TEXT NOT NULL DEFAULT '',
  company TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  service_type TEXT NOT NULL DEFAULT 'Filmagem',
  project_date TEXT NOT NULL DEFAULT '',
  project_title TEXT NOT NULL DEFAULT '',
  project_description TEXT NOT NULL DEFAULT '',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  validity_days INT NOT NULL DEFAULT 15,
  payment_terms TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  total NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.proposals TO authenticated;
GRANT ALL ON public.proposals TO service_role;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own proposals" ON public.proposals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX proposals_user_created_idx ON public.proposals (user_id, created_at DESC);

-- brand settings
CREATE TABLE public.brand_settings (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  logo_url TEXT,
  cover_url TEXT,
  establishment TEXT NOT NULL DEFAULT 'EST. 2021 — SÃO PAULO',
  tagline TEXT NOT NULL DEFAULT '',
  about_text TEXT NOT NULL DEFAULT '',
  portfolio_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.brand_settings TO authenticated;
GRANT ALL ON public.brand_settings TO service_role;
ALTER TABLE public.brand_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own brand" ON public.brand_settings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;
CREATE TRIGGER proposals_updated_at BEFORE UPDATE ON public.proposals FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER brand_settings_updated_at BEFORE UPDATE ON public.brand_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- auto-assign sequence_number per user
CREATE OR REPLACE FUNCTION public.assign_proposal_sequence() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sequence_number IS NULL OR NEW.sequence_number = 0 THEN
    SELECT COALESCE(MAX(sequence_number), 0) + 1 INTO NEW.sequence_number
    FROM public.proposals WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;
CREATE TRIGGER proposals_sequence BEFORE INSERT ON public.proposals FOR EACH ROW EXECUTE FUNCTION public.assign_proposal_sequence();
