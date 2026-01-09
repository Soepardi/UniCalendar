-- Add recurrence columns to events table

ALTER TABLE events 
ADD COLUMN IF NOT EXISTS recurrence text DEFAULT 'none', 
ADD COLUMN IF NOT EXISTS recurrence_days integer[] DEFAULT NULL;

-- recurrence values: 'none', 'daily', 'weekly', 'monthly', 'yearly', 'custom'
-- recurrence_days: array of integers 0-6 (0=Sunday, 1=Monday, etc.) used when recurrence='custom'
