-- Script de création pour la table du Tracker Career-Ops

CREATE TABLE IF NOT EXISTS public.job_applications (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    company_name TEXT NOT NULL,
    role_title TEXT NOT NULL,
    status TEXT DEFAULT '🟡 À préparer',
    category TEXT DEFAULT 'No-Code/Product',
    platform TEXT DEFAULT 'Web',
    deadline TEXT,
    score NUMERIC,
    grade TEXT,
    next_action TEXT,
    job_description TEXT,
    evaluation_summary TEXT,
    evaluation_strengths JSONB,
    evaluation_weaknesses JSONB,
    cv_markdown TEXT,
    letter_markdown TEXT,
    cv_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: To migrate an existing database, run:
-- ALTER TABLE public.job_applications ADD COLUMN cv_json JSONB;

-- Active RLS (Row Level Security)
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Autorise toutes les opérations (Sécurisé car seul l'Admin peut accéder à l'interface de toute façon, mais on peut restriindre aux utilisateurs authentifiés)
CREATE POLICY "Allow authenticated full access to job_applications" 
ON public.job_applications
FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);

-- Permettre la lecture publique (optionnel, utile si un jour vous affichez publiquement que vous êtes en process)
CREATE POLICY "Allow public read access to job_applications" 
ON public.job_applications
FOR SELECT 
TO public 
USING (true);
