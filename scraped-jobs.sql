CREATE TABLE IF NOT EXISTS public.scraped_jobs (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    company TEXT,
    location TEXT,
    platform TEXT,
    url TEXT,
    job_description TEXT,
    salary TEXT,
    contract_type TEXT DEFAULT 'CDI/CDD',
    score NUMERIC,
    grade TEXT,
    verdict TEXT,
    why_one_line TEXT,
    processed BOOLEAN DEFAULT false,
    sent_to_career_ops BOOLEAN DEFAULT false,
    alert_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.scraped_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated full access to scraped_jobs"
ON public.scraped_jobs FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access to scraped_jobs"
ON public.scraped_jobs FOR SELECT TO public USING (true);
