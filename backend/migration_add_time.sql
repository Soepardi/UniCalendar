-- Run this in your Supabase SQL Editor to add the missing columns for Time support

ALTER TABLE public.events ADD COLUMN IF NOT EXISTS time text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS color text DEFAULT 'blue';
