-- Create holidays table
CREATE TABLE IF NOT EXISTS public.holidays (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    date date NOT NULL,
    name text NOT NULL,
    calendar_type text DEFAULT 'gregorian',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone
CREATE POLICY "Allow public read access" ON public.holidays
    FOR SELECT USING (true);

-- Allow authenticated users to manage holidays (since user wants to "adjust it")
CREATE POLICY "Allow authenticated insert" ON public.holidays
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update" ON public.holidays
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete" ON public.holidays
    FOR DELETE USING (auth.role() = 'authenticated');
