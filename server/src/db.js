// SQLite database: connection, schema creation, and helpers.
// Row-level security is emulated server-side: the auth middleware attaches a
// `userId` to every request and all user-data queries filter by it.

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');
fs.mkdirSync(dataDir, { recursive: true });

const dbPath = process.env.FITWELL_DB_PATH ?? path.join(dataDir, 'fitwell.db');
export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const SCHEMA = `
create table if not exists users (
  id text primary key,
  email text not null unique,
  password_hash text not null,
  full_name text not null default '',
  role text not null default 'user',
  created_at text not null default (datetime('now'))
);

create table if not exists profiles (
  id text primary key,
  full_name text not null default '',
  age integer,
  gender text not null default 'other',
  height_cm real,
  weight_kg real,
  activity_level text not null default 'light',
  fitness_goal text not null default 'maintain',
  dietary_preference text not null default 'none',
  exclusions text not null default '[]',
  preferred_workout_duration_minutes integer not null default 30,
  sleep_goal_minutes integer not null default 480,
  calorie_target integer not null default 2000,
  protein_target integer not null default 100,
  water_target_ml integer not null default 2500,
  step_target integer not null default 8000,
  calorie_target_source text not null default 'calculated',
  protein_target_source text not null default 'calculated',
  water_target_source text not null default 'calculated',
  onboarded integer not null default 0,
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now')),
  foreign key (id) references users (id) on delete cascade
);

create table if not exists food_items (
  id text primary key,
  name text not null,
  category text not null default 'General',
  serving_unit text not null default 'serving',
  serving_size real not null default 100,
  calories real not null default 0,
  protein_g real not null default 0,
  carbs_g real not null default 0,
  fat_g real not null default 0,
  fiber_g real not null default 0,
  is_vegetarian integer not null default 1,
  contains_egg integer not null default 0,
  is_vegan integer not null default 1,
  contains_dairy integer not null default 0,
  contains_peanuts integer not null default 0,
  contains_gluten integer not null default 0,
  contains_soy integer not null default 0,
  contains_seafood integer not null default 0,
  description text not null default '',
  created_at text not null default (datetime('now'))
);
create index if not exists food_items_name_idx on food_items (name);
create index if not exists food_items_category_idx on food_items (category);

create table if not exists food_logs (
  id text primary key,
  user_id text not null references users (id) on delete cascade,
  food_item_id text references food_items (id) on delete set null,
  meal_type text not null default 'snack',
  quantity real not null default 1,
  calories real not null default 0,
  protein_g real not null default 0,
  carbs_g real not null default 0,
  fat_g real not null default 0,
  logged_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  created_at text not null default (datetime('now'))
);
create index if not exists food_logs_user_day_idx on food_logs (user_id, logged_at);

create table if not exists water_logs (
  id text primary key,
  user_id text not null references users (id) on delete cascade,
  amount_ml integer not null default 0,
  drink_type text not null default 'water',
  logged_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  created_at text not null default (datetime('now'))
);
create index if not exists water_logs_user_day_idx on water_logs (user_id, logged_at);

create table if not exists weight_logs (
  id text primary key,
  user_id text not null references users (id) on delete cascade,
  weight_kg real not null,
  logged_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  created_at text not null default (datetime('now'))
);
create index if not exists weight_logs_user_day_idx on weight_logs (user_id, logged_at);

create table if not exists sleep_logs (
  id text primary key,
  user_id text not null references users (id) on delete cascade,
  bedtime text not null,
  wake_time text not null,
  duration_minutes integer not null default 0,
  sleep_quality text,
  notes text,
  created_at text not null default (datetime('now'))
);
create index if not exists sleep_logs_user_created_idx on sleep_logs (user_id, created_at);

create table if not exists exercises (
  id text primary key,
  name text not null,
  category text not null default 'General',
  muscle_group text not null default 'Full body',
  difficulty text not null default 'beginner',
  equipment text not null default 'None',
  instructions text not null default '',
  duration_minutes integer not null default 10,
  estimated_calories integer not null default 0,
  created_at text not null default (datetime('now'))
);
create index if not exists exercises_name_idx on exercises (name);

create table if not exists workouts (
  id text primary key,
  name text not null,
  description text not null default '',
  goal text not null default 'maintain',
  difficulty text not null default 'beginner',
  duration_minutes integer not null default 30,
  workout_type text not null default 'General',
  created_at text not null default (datetime('now'))
);
create index if not exists workouts_goal_idx on workouts (goal);

create table if not exists workout_exercises (
  id text primary key,
  workout_id text not null references workouts (id) on delete cascade,
  exercise_id text not null references exercises (id) on delete cascade,
  order_index integer not null default 0,
  sets integer not null default 3,
  reps integer not null default 10,
  duration_seconds integer not null default 0,
  rest_seconds integer not null default 60
);
create index if not exists workout_exercises_workout_idx on workout_exercises (workout_id);

create table if not exists workout_logs (
  id text primary key,
  user_id text not null references users (id) on delete cascade,
  workout_id text references workouts (id) on delete set null,
  duration_minutes integer not null default 0,
  calories_burned integer not null default 0,
  completed_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  notes text,
  created_at text not null default (datetime('now'))
);
create index if not exists workout_logs_user_day_idx on workout_logs (user_id, completed_at);

create table if not exists daily_steps (
  id text primary key,
  user_id text not null references users (id) on delete cascade,
  step_count integer not null default 0,
  log_date text not null,
  created_at text not null default (datetime('now')),
  unique (user_id, log_date)
);

create table if not exists notification_settings (
  id text primary key,
  user_id text not null unique references users (id) on delete cascade,
  water_reminder integer not null default 1,
  water_time text not null default '09:00',
  meal_reminder integer not null default 1,
  meal_time text not null default '12:30',
  workout_reminder integer not null default 1,
  workout_time text not null default '18:00',
  sleep_reminder integer not null default 1,
  sleep_time text not null default '21:30',
  weekly_summary integer not null default 0,
  weekly_summary_day text not null default 'mon',
  weekly_summary_time text not null default '08:00',
  created_at text not null default (datetime('now'))
);

create table if not exists ai_conversations (
  id text primary key,
  user_id text not null references users (id) on delete cascade,
  title text not null default 'Fitness Assistant',
  created_at text not null default (datetime('now'))
);
create index if not exists ai_conversations_user_idx on ai_conversations (user_id, created_at desc);

create table if not exists ai_messages (
  id text primary key,
  conversation_id text not null references ai_conversations (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null default '',
  created_at text not null default (datetime('now'))
);
create index if not exists ai_messages_conv_idx on ai_messages (conversation_id, created_at);
`;

export function initSchema() {
  db.exec(SCHEMA);
}

// ---- tiny, useful helpers -------------------------------------------------
export function genId(prefix = '') {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

export function mapFoodRow(row) {
  if (!row) return row;
  return {
    ...row,
    is_vegetarian: !!row.is_vegetarian,
    contains_egg: !!row.contains_egg,
    is_vegan: !!row.is_vegan,
    contains_dairy: !!row.contains_dairy,
    contains_peanuts: !!row.contains_peanuts,
    contains_gluten: !!row.contains_gluten,
    contains_soy: !!row.contains_soy,
    contains_seafood: !!row.contains_seafood,
  };
}
