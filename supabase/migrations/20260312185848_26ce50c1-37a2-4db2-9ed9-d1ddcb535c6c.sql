-- Create status enum
CREATE TYPE public.polter_status AS ENUM ('Neu', 'Bereit', 'Transport zugewiesen', 'Abgeholt', 'Geliefert');

-- Create booking type enum
CREATE TYPE public.booking_type AS ENUM ('checkin', 'checkout');

-- Create partners table (transporteure + kaeufer combined)
CREATE TABLE public.partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  typ TEXT NOT NULL CHECK (typ IN ('transporteur', 'kaeufer')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Partners are publicly readable" ON public.partners FOR SELECT USING (true);
CREATE POLICY "Partners are publicly insertable" ON public.partners FOR INSERT WITH CHECK (true);
CREATE POLICY "Partners are publicly updatable" ON public.partners FOR UPDATE USING (true);
CREATE POLICY "Partners are publicly deletable" ON public.partners FOR DELETE USING (true);

-- Create polter table
CREATE TABLE public.polter (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sortiment TEXT NOT NULL,
  volumen NUMERIC NOT NULL DEFAULT 0,
  beschreibung TEXT NOT NULL DEFAULT '',
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  eudr_nummer TEXT NOT NULL DEFAULT '',
  status public.polter_status NOT NULL DEFAULT 'Neu',
  forstbetrieb TEXT NOT NULL DEFAULT '',
  transporteur_id UUID REFERENCES public.partners(id) ON DELETE SET NULL,
  transporteur_name TEXT,
  kaeufer_id UUID REFERENCES public.partners(id) ON DELETE SET NULL,
  kaeufer_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.polter ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Polter are publicly readable" ON public.polter FOR SELECT USING (true);
CREATE POLICY "Polter are publicly insertable" ON public.polter FOR INSERT WITH CHECK (true);
CREATE POLICY "Polter are publicly updatable" ON public.polter FOR UPDATE USING (true);
CREATE POLICY "Polter are publicly deletable" ON public.polter FOR DELETE USING (true);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  polter_id UUID NOT NULL REFERENCES public.polter(id) ON DELETE CASCADE,
  typ public.booking_type NOT NULL,
  menge NUMERIC NOT NULL,
  foto_url TEXT,
  erstellt_von TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Bookings are publicly readable" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Bookings are publicly insertable" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Bookings are publicly updatable" ON public.bookings FOR UPDATE USING (true);
CREATE POLICY "Bookings are publicly deletable" ON public.bookings FOR DELETE USING (true);

-- Seed initial partners
INSERT INTO public.partners (id, name, typ) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Transport Frey AG', 'transporteur'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Holztransporte Müller', 'transporteur'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Fuhrwerk Schmid GmbH', 'transporteur'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Sägewerk Villiger', 'kaeufer'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Holzhandel Zubler', 'kaeufer'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Biomasse Aargau AG', 'kaeufer');