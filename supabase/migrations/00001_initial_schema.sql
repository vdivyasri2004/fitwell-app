-- FitWell initial schema
-- Types, enums and base tables (no RLS here; see 00002_policies.sql)

begin;

-- ============================= Enums =====================================
create type public.fitness_goal      as enum ('lose_weight', 'build_muscle', 'gain_weight', 'maintain');
create type public.activity_level    as enum ('sedentary', 'light', 'moderate', 'very_active');
create type public.dietary_preference as enum ('none', 'vegetarian', 'eggetarian', 'vegan', 'non_vegetarian');
create type public.gender            as enum ('male', 'female', 'other');
create type public.target_source     as enum ('calculated', 'manual');
create type public.meal_type         as enum ('breakfast', 'lunch', 'dinner', 'snack');
create type public.drink_type        as enum ('water', 'other');
create type public.sleep_quality     as enum ('poor', 'fair', 'good', 'excellent');
create type public.difficulty        as enum ('beginner', 'intermediate', 'advanced');
create type public.user_role         as enum ('user', 'admin');

-- ============================= Profiles ==================================
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  age integer check (age > 0 and age < 130),
  gender public.gender not null default 'other',
  height_cm numeric check (height_cm > 0 and height_cm < 300),
  weight_kg numeric check (weight_kg > 0 and weight_kg < 500),
  activity_level public.activity_level not null default 'light',
  fitness_goal public.fitness_goal not null default 'maintain',
  dietary_preference public.dietary_preference not null default 'none',
  exclusions text[] not null default '{}',
  preferred_workout_duration_minutes integer not null default 30,
  sleep_goal_minutes integer not null default 480,
  calorie_target integer not null default 2000,
  protein_target integer not null default 100,
  water_target_ml integer not null default 2500,
  step_target integer not null default 8000,
  calorie_target_source public.target_source not null default 'calculated',
  protein_target_source public.target_source not null default 'calculated',
  water_target_source public.target_source not null default 'calculated',
  onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================= Food items ================================
create table public.food_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'General',
  serving_unit text not null default 'serving',
  serving_size numeric not null default 100,
  calories numeric not null default 0,
  protein_g numeric not null default 0,
  carbs_g numeric not null default 0,
  fat_g numeric not null default 0,
  fiber_g numeric not null default 0,
  is_vegetarian boolean not null default true,
  contains_egg boolean not null default false,
  is_vegan boolean not null default true,
  contains_dairy boolean not null default false,
  contains_peanuts boolean not null default false,
  contains_gluten boolean not null default false,
  contains_soy boolean not null default false,
  contains_seafood boolean not null default false,
  description text not null default '',
  created_at timestamptz not null default now()
);
create index food_items_name_idx on public.food_items (name);
create index food_items_category_idx on public.food_items (category);

-- ============================= Exercises =================================
create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'General',
  muscle_group text not null default 'Full body',
  difficulty public.difficulty not null default 'beginner',
  equipment text not null default 'None',
  instructions text not null default '',
  duration_minutes integer not null default 10,
  estimated_calories integer not null default 0,
  created_at timestamptz not null default now()
);
create index exercises_name_idx on public.exercises (name);

-- ============================= Workouts ==================================
create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  goal public.fitness_goal not null default 'maintain',
  difficulty public.difficulty not null default 'beginner',
  duration_minutes integer not null default 30,
  workout_type text not null default 'General',
  created_at timestamptz not null default now()
);
create index workouts_goal_idx on public.workouts (goal);

create table public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete cascade,
  order_index integer not null default 0,
  sets integer not null default 3,
  reps integer not null default 10,
  duration_seconds integer not null default 0,
  rest_seconds integer not null default 60,
  unique (workout_id, exercise_id, order_index)
);
create index workout_exercises_workout_idx on public.workout_exercises (workout_id);

-- ============================= User data =================================
create table public.food_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  food_item_id uuid references public.food_items (id) on delete set null,
  meal_type public.meal_type not null default 'snack',
  quantity numeric not null default 1,
  calories numeric not null default 0,
  protein_g numeric not null default 0,
  carbs_g numeric not null default 0,
  fat_g numeric not null default 0,
  logged_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index food_logs_user_day_idx on public.food_logs (user_id, logged_at);

create table public.water_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  amount_ml integer not null default 0,
  drink_type public.drink_type not null default 'water',
  logged_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index water_logs_user_day_idx on public.water_logs (user_id, logged_at);

create table public.weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  weight_kg numeric not null,
  logged_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index weight_logs_user_day_idx on public.weight_logs (user_id, logged_at);

create table public.sleep_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  bedtime timestamptz not null,
  wake_time timestamptz not null,
  duration_minutes integer not null default 0,
  sleep_quality public.sleep_quality,
  notes text,
  created_at timestamptz not null default now()
);
create index sleep_logs_user_created_idx on public.sleep_logs (user_id, created_at);

create table public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  workout_id uuid references public.workouts (id) on delete set null,
  duration_minutes integer not null default 0,
  calories_burned integer not null default 0,
  completed_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now()
);
create index workout_logs_user_day_idx on public.workout_logs (user_id, completed_at);

create table public.daily_steps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  step_count integer not null default 0,
  log_date date not null,
  created_at timestamptz not null default now(),
  unique (user_id, log_date)
);

create table public.notification_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  water_reminder boolean not null default true,
  water_time text not null default '09:00',
  meal_reminder boolean not null default true,
  meal_time text not null default '12:30',
  workout_reminder boolean not null default true,
  workout_time text not null default '18:00',
  sleep_reminder boolean not null default true,
  sleep_time text not null default '21:30',
  weekly_summary boolean not null default false,
  weekly_summary_day text not null default 'mon',
  weekly_summary_time text not null default '08:00',
  created_at timestamptz not null default now(),
  unique (user_id)
);

-- ============================= AI ========================================
create table public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default 'Fitness Assistant',
  created_at timestamptz not null default now()
);
create index ai_conversations_user_idx on public.ai_conversations (user_id, created_at desc);

create table public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null default '',
  created_at timestamptz not null default now()
);
create index ai_messages_conv_idx on public.ai_messages (conversation_id, created_at);

-- ============================= Admin / roles =============================
-- Admin role is determined server-side only. Regular clients have no read or
-- write access to this table (see policies). The admin dashboard uses the
-- service role, and the 'ai' edge function checks is_admin() in the database.
create table public.user_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'user',
  created_at timestamptz not null default now()
);

-- ============================= Functions =================================
-- Server-side admin check. SECURITY DEFINER lets the check read user_roles even
-- though callers have no direct access. This runs in the database (server),
-- never in the client.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

-- Auto-update updated_at on profiles
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Insert a matching profile + notification_settings row when a new user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;

  insert into public.notification_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

commit;
