-- Table career_profile pour stocker le profil Career Ops
CREATE TABLE IF NOT EXISTS public.career_profile (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    target_role TEXT DEFAULT 'Product Builder / No-Code Expert',
    sector TEXT DEFAULT 'Digital / Tech / Ops',
    location TEXT DEFAULT 'France / Télétravail',
    salary_expectation TEXT DEFAULT 'A discuter selon profil et impact genere',
    absolutely_avoid TEXT DEFAULT 'Developpement pur (backend lourd, C++, mobile natif), ESN tres classiques',
    response_tone TEXT DEFAULT 'Professionnel, direct, oriente impact business et technique.',
    cv_text TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.career_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated full access to career_profile"
ON public.career_profile FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access to career_profile"
ON public.career_profile FOR SELECT TO public USING (true);

INSERT INTO public.career_profile (target_role, cv_text) VALUES ('Product Builder / Ops No-Code', '');
