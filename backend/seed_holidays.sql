-- Seed Gregorian Holidays for 2026
INSERT INTO public.holidays (date, name, calendar_type) VALUES
('2026-01-01', 'New Year''s Day', 'gregorian'),
('2026-02-14', 'Valentine''s Day', 'gregorian'),
('2026-03-17', 'St. Patrick''s Day', 'gregorian'),
('2026-05-01', 'Labor Day', 'gregorian'),
('2026-12-25', 'Christmas Day', 'gregorian')
ON CONFLICT DO NOTHING;

-- Seed for 2025 just in case
INSERT INTO public.holidays (date, name, calendar_type) VALUES
('2025-01-01', 'New Year''s Day', 'gregorian'),
('2025-02-14', 'Valentine''s Day', 'gregorian'),
('2025-03-17', 'St. Patrick''s Day', 'gregorian'),
('2025-05-01', 'Labor Day', 'gregorian'),
('2025-12-25', 'Christmas Day', 'gregorian')
ON CONFLICT DO NOTHING;
