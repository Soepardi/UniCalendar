-- Add type column to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS type text DEFAULT 'personal' CHECK (type IN ('work', 'personal'));

-- Comment on column
COMMENT ON COLUMN public.events.type IS 'Event type: work or personal';
