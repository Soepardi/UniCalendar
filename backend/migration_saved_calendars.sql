-- Add weekly settings columns to saved_calendars
ALTER TABLE public.saved_calendars
ADD COLUMN IF NOT EXISTS weekly_holiday integer DEFAULT 0 CHECK (weekly_holiday BETWEEN 0 AND 6), -- 0=Sunday
ADD COLUMN IF NOT EXISTS weekly_special_day integer DEFAULT 5 CHECK (weekly_special_day BETWEEN 0 AND 6); -- 5=Friday

COMMENT ON COLUMN public.saved_calendars.weekly_holiday IS 'Day of week index (0-6) for weekly holiday (Red)';
COMMENT ON COLUMN public.saved_calendars.weekly_special_day IS 'Day of week index (0-6) for weekly special day (Blue)';
