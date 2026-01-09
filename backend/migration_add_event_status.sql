
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'archived'));

-- Update existing events to have 'pending' status
UPDATE events SET status = 'pending' WHERE status IS NULL;
