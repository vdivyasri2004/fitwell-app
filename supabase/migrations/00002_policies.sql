-- FitWell RLS policies
-- Principles:
--   * Row Level Security is enabled on every table (no default public access).
--   * Users access only their own rows (auth.uid() = user_id).
--   * Reference/global tables (food_items, exercises, workouts, workout_exercises)
--     are readable by any authenticated user but writable only by admins.
--   * Admin role is determined server-side via public.is_admin() (security
--     definer); clients can never read user_roles directly.

begin;

alter table public.profiles             enable row level security;
alter table public.food_items           enable row level security;
alter table public.exercises            enable row level security;
alter table public.workouts             enable row level security;
alter table public.workout_exercises    enable row level security;
alter table public.food_logs            enable row level security;
alter table public.water_logs           enable row level security;
alter table public.weight_logs          enable row level security;
alter table public.sleep_logs           enable row level security;
alter table public.workout_logs         enable row level security;
alter table public.daily_steps          enable row level security;
alter table public.notification_settings enable row level security;
alter table public.ai_conversations     enable row level security;
alter table public.ai_messages           enable row level security;
alter table public.user_roles           enable row level security;

-- ============================= Profiles ==================================
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- ============================= Global tables =============================
-- Readable by any authenticated user; only admins can modify.
create policy "food_items_select_auth" on public.food_items
  for select to authenticated using (true);

create policy "food_items_write_admin" on public.food_items
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "exercises_select_auth" on public.exercises
  for select to authenticated using (true);

create policy "exercises_write_admin" on public.exercises
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "workouts_select_auth" on public.workouts
  for select to authenticated using (true);

create policy "workouts_write_admin" on public.workouts
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "workout_exercises_select_auth" on public.workout_exercises
  for select to authenticated using (true);

create policy "workout_exercises_write_admin" on public.workout_exercises
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ============================= Food logs =================================
create policy "food_logs_select_own" on public.food_logs
  for select using (auth.uid() = user_id);

create policy "food_logs_insert_own" on public.food_logs
  for insert with check (auth.uid() = user_id);

create policy "food_logs_update_own" on public.food_logs
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "food_logs_delete_own" on public.food_logs
  for delete using (auth.uid() = user_id);

-- ============================= Water logs ================================
create policy "water_logs_select_own" on public.water_logs
  for select using (auth.uid() = user_id);

create policy "water_logs_insert_own" on public.water_logs
  for insert with check (auth.uid() = user_id);

create policy "water_logs_delete_own" on public.water_logs
  for delete using (auth.uid() = user_id);

-- ============================= Weight logs ===============================
create policy "weight_logs_select_own" on public.weight_logs
  for select using (auth.uid() = user_id);

create policy "weight_logs_insert_own" on public.weight_logs
  for insert with check (auth.uid() = user_id);

create policy "weight_logs_update_own" on public.weight_logs
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "weight_logs_delete_own" on public.weight_logs
  for delete using (auth.uid() = user_id);

-- ============================= Sleep logs ================================
create policy "sleep_logs_select_own" on public.sleep_logs
  for select using (auth.uid() = user_id);

create policy "sleep_logs_insert_own" on public.sleep_logs
  for insert with check (auth.uid() = user_id);

create policy "sleep_logs_update_own" on public.sleep_logs
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "sleep_logs_delete_own" on public.sleep_logs
  for delete using (auth.uid() = user_id);

-- ============================= Workout logs ==============================
create policy "workout_logs_select_own" on public.workout_logs
  for select using (auth.uid() = user_id);

create policy "workout_logs_insert_own" on public.workout_logs
  for insert with check (auth.uid() = user_id);

create policy "workout_logs_delete_own" on public.workout_logs
  for delete using (auth.uid() = user_id);

-- ============================= Daily steps ===============================
create policy "daily_steps_select_own" on public.daily_steps
  for select using (auth.uid() = user_id);

create policy "daily_steps_insert_own" on public.daily_steps
  for insert with check (auth.uid() = user_id);

create policy "daily_steps_update_own" on public.daily_steps
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================= Notification settings =====================
create policy "notif_settings_select_own" on public.notification_settings
  for select using (auth.uid() = user_id);

create policy "notif_settings_insert_own" on public.notification_settings
  for insert with check (auth.uid() = user_id);

create policy "notif_settings_update_own" on public.notification_settings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================= AI ========================================
create policy "ai_conversations_select_own" on public.ai_conversations
  for select using (auth.uid() = user_id);

create policy "ai_conversations_insert_own" on public.ai_conversations
  for insert with check (auth.uid() = user_id);

-- Messages belong to a conversation owned by the user.
create policy "ai_messages_select_own" on public.ai_messages
  for select using (
    exists (
      select 1 from public.ai_conversations c
      where c.id = conversation_id and c.user_id = auth.uid()
    )
  );

create policy "ai_messages_insert_own" on public.ai_messages
  for insert with check (
    exists (
      select 1 from public.ai_conversations c
      where c.id = conversation_id and c.user_id = auth.uid()
    )
  );

-- ============================= User roles ================================
-- Deny by default for normal users. Only admins (determined server-side) may
-- read/write. The admin web dashboard also uses the service role, which
-- bypasses RLS, as the primary path.
create policy "user_roles_select_admin" on public.user_roles
  for select to authenticated using (public.is_admin());

create policy "user_roles_insert_admin" on public.user_roles
  for insert to authenticated with check (public.is_admin());

create policy "user_roles_update_admin" on public.user_roles
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "user_roles_delete_admin" on public.user_roles
  for delete to authenticated using (public.is_admin());

commit;
