-- FitWell admin RPC functions
--
-- The admin web dashboard performs all privileged operations through these
-- SECURITY DEFINER functions. Each one first checks public.is_admin() (which
-- resolves the role in the database, never from the client). This keeps admin
-- determination and elevated access fully server-side.

begin;

-- ============================= Stats =====================================
create or replace function public.admin_stats()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'Admin access required';
  end if;

  select jsonb_build_object(
    'users', (select count(*) from public.profiles),
    'foods', (select count(*) from public.food_items),
    'exercises', (select count(*) from public.exercises),
    'workouts', (select count(*) from public.workouts),
    'food_logs', (select count(*) from public.food_logs),
    'workout_logs', (select count(*) from public.workout_logs),
    'admins', (select count(*) from public.user_roles where role = 'admin')
  ) into result;
  return result;
end;
$$;

-- ============================= Users =====================================
create or replace function public.admin_list_users()
returns table (
  id uuid,
  full_name text,
  email text,
  age integer,
  gender public.gender,
  fitness_goal public.fitness_goal,
  dietary_preference public.dietary_preference,
  onboarded boolean,
  created_at timestamptz,
  is_admin boolean
)
language sql
security definer
set search_path = public
as $$
  select
    p.id,
    p.full_name,
    u.email,
    p.age,
    p.gender,
    p.fitness_goal,
    p.dietary_preference,
    p.onboarded,
    p.created_at,
    coalesce((select r.role = 'admin' from public.user_roles r where r.user_id = p.id), false)
  from public.profiles p
  left join auth.users u on u.id = p.id
  where public.is_admin()
  order by p.created_at desc;
$$;

create or replace function public.admin_set_role(user_id uuid, role public.user_role)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Admin access required';
  end if;

  insert into public.user_roles (user_id, role)
  values (user_id, role)
  on conflict (user_id)
  do update set role = excluded.role;
end;
$$;

create or replace function public.admin_delete_user(user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Admin access required';
  end if;
  delete from public.profiles where id = user_id;
end;
$$;

-- ============================= Foods =====================================
create or replace function public.admin_upsert_food(payload jsonb)
returns public.food_items
language plpgsql
security definer
set search_path = public
as $$
declare
  row public.food_items;
begin
  if not public.is_admin() then
    raise exception 'Admin access required';
  end if;

  insert into public.food_items (
    id, name, category, serving_unit, serving_size, calories, protein_g, carbs_g, fat_g,
    fiber_g, is_vegetarian, contains_egg, is_vegan, contains_dairy, contains_peanuts,
    contains_gluten, contains_soy, contains_seafood, description
  )
  values (
    coalesce((payload->>'id')::uuid, gen_random_uuid()),
    payload->>'name',
    coalesce(payload->>'category', 'General'),
    coalesce(payload->>'serving_unit', 'serving'),
    coalesce((payload->>'serving_size')::numeric, 100),
    coalesce((payload->>'calories')::numeric, 0),
    coalesce((payload->>'protein_g')::numeric, 0),
    coalesce((payload->>'carbs_g')::numeric, 0),
    coalesce((payload->>'fat_g')::numeric, 0),
    coalesce((payload->>'fiber_g')::numeric, 0),
    coalesce((payload->>'is_vegetarian')::boolean, true),
    coalesce((payload->>'contains_egg')::boolean, false),
    coalesce((payload->>'is_vegan')::boolean, true),
    coalesce((payload->>'contains_dairy')::boolean, false),
    coalesce((payload->>'contains_peanuts')::boolean, false),
    coalesce((payload->>'contains_gluten')::boolean, false),
    coalesce((payload->>'contains_soy')::boolean, false),
    coalesce((payload->>'contains_seafood')::boolean, false),
    coalesce(payload->>'description', '')
  )
  on conflict (id) do update set
    name = excluded.name,
    category = excluded.category,
    serving_unit = excluded.serving_unit,
    serving_size = excluded.serving_size,
    calories = excluded.calories,
    protein_g = excluded.protein_g,
    carbs_g = excluded.carbs_g,
    fat_g = excluded.fat_g,
    fiber_g = excluded.fiber_g,
    is_vegetarian = excluded.is_vegetarian,
    contains_egg = excluded.contains_egg,
    is_vegan = excluded.is_vegan,
    contains_dairy = excluded.contains_dairy,
    contains_peanuts = excluded.contains_peanuts,
    contains_gluten = excluded.contains_gluten,
    contains_soy = excluded.contains_soy,
    contains_seafood = excluded.contains_seafood,
    description = excluded.description
  returning * into row;

  return row;
end;
$$;

create or replace function public.admin_delete_food(food_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Admin access required';
  end if;
  delete from public.food_items where id = food_id;
end;
$$;

-- ============================= Exercises =================================
create or replace function public.admin_upsert_exercise(payload jsonb)
returns public.exercises
language plpgsql
security definer
set search_path = public
as $$
declare
  row public.exercises;
begin
  if not public.is_admin() then
    raise exception 'Admin access required';
  end if;

  insert into public.exercises (id, name, category, muscle_group, difficulty, equipment, instructions, duration_minutes, estimated_calories)
  values (
    coalesce((payload->>'id')::uuid, gen_random_uuid()),
    payload->>'name',
    coalesce(payload->>'category', 'General'),
    coalesce(payload->>'muscle_group', 'Full body'),
    coalesce((payload->>'difficulty')::public.difficulty, 'beginner'),
    coalesce(payload->>'equipment', 'None'),
    coalesce(payload->>'instructions', ''),
    coalesce((payload->>'duration_minutes')::integer, 10),
    coalesce((payload->>'estimated_calories')::integer, 0)
  )
  on conflict (id) do update set
    name = excluded.name,
    category = excluded.category,
    muscle_group = excluded.muscle_group,
    difficulty = excluded.difficulty,
    equipment = excluded.equipment,
    instructions = excluded.instructions,
    duration_minutes = excluded.duration_minutes,
    estimated_calories = excluded.estimated_calories
  returning * into row;

  return row;
end;
$$;

create or replace function public.admin_delete_exercise(exercise_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Admin access required';
  end if;
  delete from public.exercises where id = exercise_id;
end;
$$;

-- ============================= Workouts ==================================
create or replace function public.admin_upsert_workout(payload jsonb)
returns public.workouts
language plpgsql
security definer
set search_path = public
as $$
declare
  row public.workouts;
begin
  if not public.is_admin() then
    raise exception 'Admin access required';
  end if;

  insert into public.workouts (id, name, description, goal, difficulty, duration_minutes, workout_type)
  values (
    coalesce((payload->>'id')::uuid, gen_random_uuid()),
    payload->>'name',
    coalesce(payload->>'description', ''),
    coalesce((payload->>'goal')::public.fitness_goal, 'maintain'),
    coalesce((payload->>'difficulty')::public.difficulty, 'beginner'),
    coalesce((payload->>'duration_minutes')::integer, 30),
    coalesce(payload->>'workout_type', 'General')
  )
  on conflict (id) do update set
    name = excluded.name,
    description = excluded.description,
    goal = excluded.goal,
    difficulty = excluded.difficulty,
    duration_minutes = excluded.duration_minutes,
    workout_type = excluded.workout_type
  returning * into row;

  return row;
end;
$$;

create or replace function public.admin_workout_exercises(workout_id uuid)
returns table (
  id uuid,
  exercise_id uuid,
  name text,
  muscle_group text,
  order_index integer,
  sets integer,
  reps integer,
  duration_seconds integer,
  rest_seconds integer
)
language sql
security definer
set search_path = public
as $$
  select we.id, e.id, e.name, e.muscle_group, we.order_index, we.sets, we.reps, we.duration_seconds, we.rest_seconds
  from public.workout_exercises we
  join public.exercises e on e.id = we.exercise_id
  where we.workout_id = workout_id
    and public.is_admin()
  order by we.order_index;
$$;

-- Replace the full exercise list of a workout (deltas handled server-side).
create or replace function public.admin_save_workout_exercises(workout_id uuid, exercises jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Admin access required';
  end if;

  delete from public.workout_exercises where workout_id = admin_save_workout_exercises.workout_id;

  insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, duration_seconds, rest_seconds)
  select
    workout_id,
    (item->>'exercise_id')::uuid,
    coalesce((item->>'order_index')::integer, 0),
    coalesce((item->>'sets')::integer, 3),
    coalesce((item->>'reps')::integer, 10),
    coalesce((item->>'duration_seconds')::integer, 0),
    coalesce((item->>'rest_seconds')::integer, 60)
  from jsonb_array_elements(exercises) as item;
end;
$$;

create or replace function public.admin_all_exercises()
returns setof public.exercises
language sql
security definer
set search_path = public
as $$
  select * from public.exercises where public.is_admin() order by name;
$$;

create or replace function public.admin_delete_workout(workout_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Admin access required';
  end if;
  delete from public.workouts where id = workout_id;
end;
$$;

-- ============================= Search (admin) ============================
create or replace function public.admin_search_foods(term text default '')
returns setof public.food_items
language sql
security definer
set search_path = public
as $$
  select * from public.food_items
  where public.is_admin()
    and (term = '' or name ilike '%' || term || '%')
  order by name;
$$;

-- ============================= Role check RPC ============================
-- Returns the server-side admin verdict so the dashboard can gate its UI.
create or replace function public.current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin();
$$;

commit;
