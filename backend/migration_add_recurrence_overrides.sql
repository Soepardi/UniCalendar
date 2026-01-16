
-- Migration to support instance-level status for recurring events
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS completed_dates TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS excluded_dates TEXT[] DEFAULT '{}';

-- Re-run status check if needed
ALTER TABLE events 
DROP CONSTRAINT IF EXISTS events_status_check;

ALTER TABLE events 
ADD CONSTRAINT events_status_check 
CHECK (status IN ('pending', 'completed', 'archived'));
