-- Create the 'events' table
create table if not exists public.events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  date date not null,
  description text,
  color text default 'blue', -- blue, green, red, yellow, purple
  time text, -- 'HH:mm' format
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.events enable row level security;

-- Create Policy: Users can only see their own events
create policy "Users can view their own events"
on public.events for select
using ( auth.uid() = user_id );

-- Create Policy: Users can create their own events
create policy "Users can create their own events"
on public.events for insert
with check ( auth.uid() = user_id );

-- Create Policy: Users can update their own events
create policy "Users can update their own events"
on public.events for update
using ( auth.uid() = user_id );

-- Create Policy: Users can delete their own events
create policy "Users can delete their own events"
on public.events for delete
using ( auth.uid() = user_id );

-- MIGRATION: 
-- alter table public.events add column if not exists color text default 'blue';
-- alter table public.events add column if not exists time text;
