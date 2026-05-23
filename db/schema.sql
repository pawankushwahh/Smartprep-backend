-- ============================================================
-- SmartPrep — Supabase SQL Schema
-- Run this entire file in the Supabase SQL Editor
-- supabase.com > Your Project > SQL Editor > New Query
-- ============================================================

-- 1. Profiles table
-- Extends Supabase's built-in auth.users with extra fields
create table if not exists profiles (
  id uuid references auth.users primary key,
  name text not null,
  exam_type text not null,
  target_date date,
  created_at timestamp default now()
);

-- 2. Topics table
-- AI-recommended topics saved per user
create table if not exists topics (
  id serial primary key,
  user_id uuid references profiles(id) on delete cascade,
  name text not null,
  exam_type text not null,
  priority text check (priority in ('high', 'medium', 'low')),
  time_estimate text,
  created_at timestamp default now()
);

-- 3. Resources table
-- Study resources (videos, articles, PDFs) linked to topics
create table if not exists resources (
  id serial primary key,
  topic text not null,
  title text not null,
  url text not null,
  source text check (source in ('YouTube', 'PDF', 'Article', 'Website'))
);

-- ============================================================
-- SEED DATA — Sample resources (optional but helpful for testing)
-- ============================================================
insert into resources (topic, title, url, source) values
  ('History', 'Indian History for UPSC - Complete Playlist', 'https://www.youtube.com/playlist?list=PLXvFmA2t3rM', 'YouTube'),
  ('History', 'Ancient India - NCERT Summary PDF', 'https://ncert.nic.in/textbook.php', 'PDF'),
  ('History', 'French Revolution - Khan Academy', 'https://www.khanacademy.org/humanities/world-history', 'Website'),
  ('Mathematics', 'JEE Maths Full Course', 'https://www.youtube.com/c/MathsIsFun', 'YouTube'),
  ('Physics', 'NEET Physics - Pradeep Notes', 'https://www.pradeepbooks.com', 'PDF'),
  ('Economics', 'Indian Economy for UPSC', 'https://www.youtube.com/watch?v=example', 'YouTube'),
  ('Geography', 'World Geography - Complete Guide', 'https://www.nationalgeographic.com', 'Website'),
  ('Biology', 'NCERT Biology Class 11 & 12', 'https://ncert.nic.in', 'PDF');

-- ============================================================
-- ROW LEVEL SECURITY (RLS) — Recommended for production
-- ============================================================

-- Enable RLS on profiles
alter table profiles enable row level security;
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Enable RLS on topics
alter table topics enable row level security;
create policy "Users can view own topics"
  on topics for select using (auth.uid() = user_id);
create policy "Users can insert own topics"
  on topics for insert with check (auth.uid() = user_id);
create policy "Users can delete own topics"
  on topics for delete using (auth.uid() = user_id);

-- Resources are publicly readable
alter table resources enable row level security;
create policy "Resources are publicly readable"
  on resources for select using (true);
