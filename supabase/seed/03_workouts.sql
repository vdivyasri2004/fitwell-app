-- FitWell seed: workouts + workout_exercises
-- Workouts cover the four fitness goals and a range of difficulties. Exercise
-- id resolution uses names seeded in 02_exercises.sql so the script is portable.

insert into public.workouts (name, description, goal, difficulty, duration_minutes, workout_type)
values
  ('Full Body Beginner', 'A gentle introduction covering the major muscle groups with bodyweight movements.', 'maintain', 'beginner', 30, 'Strength'),
  ('Fat Burn Express', 'A short, high-cadence circuit to boost calorie burn and cardiovascular fitness.', 'lose_weight', 'beginner', 25, 'Cardio'),
  ('Core Foundations', 'Focus on abdominal and lower-back strength for a stable, strong core.', 'maintain', 'beginner', 20, 'Core'),
  ('Leg Day Builder', 'Build lower body strength and muscle with squat and hinge movements.', 'build_muscle', 'intermediate', 40, 'Strength'),
  ('Upper Body Strength', 'Develop chest, back, shoulders and arms with compound lifts.', 'build_muscle', 'intermediate', 40, 'Strength'),
  ('Lean Body Circuit', 'Combine resistance and cardio moves to support fat loss while building muscle.', 'lose_weight', 'intermediate', 35, 'Circuit'),
  ('Muscle Gain Hypertrophy', 'Higher volume strength work to stimulate muscle growth.', 'gain_weight', 'advanced', 50, 'Strength'),
  ('Endurance Blast', 'Continuous cardio intervals to improve stamina and conditioning.', 'lose_weight', 'intermediate', 30, 'Cardio'),
  ('Power & Conditioning', 'Explosive movements to build athletic power and conditioning.', 'build_muscle', 'advanced', 45, 'Circuit'),
  ('Mobility & Recovery', 'Gentle movement and stretching to improve flexibility and aid recovery.', 'maintain', 'beginner', 20, 'Mobility'),
  ('Quick Kitchen HIIT', 'A fast home workout using no equipment, ideal for beginners on busy days.', 'lose_weight', 'beginner', 20, 'HIIT'),
  ('Bodyweight Mass Builder', 'Progressive bodyweight movements to build lean muscle at home.', 'gain_weight', 'intermediate', 40, 'Strength');

insert into public.workout_exercises (workout_id, exercise_id, order_index, sets, reps, duration_seconds, rest_seconds)
select w.id, e.id, x.ord, x.sets, x.reps, x.dur, x.rest
from public.workouts w
cross join lateral (
  values
    ('Full Body Beginner', 'Bodyweight Squats', 1, 3, 12, 0, 30),
    ('Full Body Beginner', 'Push-Ups', 2, 3, 8, 0, 30),
    ('Full Body Beginner', 'Lunges', 3, 3, 10, 0, 30),
    ('Full Body Beginner', 'Plank', 4, 3, 0, 30, 20),

    ('Fat Burn Express', 'Jumping Jacks', 1, 3, 0, 40, 20),
    ('Fat Burn Express', 'High Knees', 2, 3, 0, 40, 20),
    ('Fat Burn Express', 'Mountain Climbers', 3, 3, 0, 40, 20),
    ('Fat Burn Express', 'Bodyweight Squats', 4, 3, 15, 0, 20),

    ('Core Foundations', 'Plank', 1, 3, 0, 30, 20),
    ('Core Foundations', 'Russian Twists', 2, 3, 20, 0, 20),
    ('Core Foundations', 'Glute Bridge', 3, 3, 15, 0, 20),
    ('Core Foundations', 'Mountain Climbers', 4, 3, 0, 40, 20),

    ('Leg Day Builder', 'Bodyweight Squats', 1, 4, 15, 0, 45),
    ('Leg Day Builder', 'Lunges', 2, 3, 12, 0, 45),
    ('Leg Day Builder', 'Jump Squats', 3, 3, 10, 0, 45),
    ('Leg Day Builder', 'Calf Raises', 4, 3, 20, 0, 30),

    ('Upper Body Strength', 'Push-Ups', 1, 4, 12, 0, 45),
    ('Upper Body Strength', 'Dumbbell Row', 2, 3, 12, 0, 45),
    ('Upper Body Strength', 'Dumbbell Shoulder Press', 3, 3, 10, 0, 45),
    ('Upper Body Strength', 'Tricep Dips', 4, 3, 12, 0, 45),

    ('Lean Body Circuit', 'Bodyweight Squats', 1, 3, 15, 0, 20),
    ('Lean Body Circuit', 'Push-Ups', 2, 3, 10, 0, 20),
    ('Lean Body Circuit', 'High Knees', 3, 3, 0, 40, 20),
    ('Lean Body Circuit', 'Plank', 4, 3, 0, 30, 20),

    ('Muscle Gain Hypertrophy', 'Bench Press', 1, 4, 8, 0, 60),
    ('Muscle Gain Hypertrophy', 'Pull-Ups', 2, 4, 8, 0, 60),
    ('Muscle Gain Hypertrophy', 'Dumbbell Shoulder Press', 3, 4, 10, 0, 60),
    ('Muscle Gain Hypertrophy', 'Dumbbell Bicep Curl', 4, 3, 12, 0, 45),

    ('Endurance Blast', 'Skipping (Jump Rope)', 1, 4, 0, 45, 15),
    ('Endurance Blast', 'High Knees', 2, 4, 0, 45, 15),
    ('Endurance Blast', 'Jumping Jacks', 3, 4, 0, 45, 15),
    ('Endurance Blast', 'Mountain Climbers', 4, 4, 0, 45, 15),

    ('Power & Conditioning', 'Burpees', 1, 4, 10, 0, 45),
    ('Power & Conditioning', 'Jump Squats', 2, 4, 12, 0, 45),
    ('Power & Conditioning', 'Mountain Climbers', 3, 4, 0, 45, 20),
    ('Power & Conditioning', 'Plank', 4, 4, 0, 45, 20),

    ('Mobility & Recovery', 'Surya Namaskar (Sun Salute)', 1, 2, 0, 60, 15),
    ('Mobility & Recovery', 'Glute Bridge', 2, 3, 12, 0, 20),
    ('Mobility & Recovery', 'Calf Raises', 3, 2, 12, 0, 20),

    ('Quick Kitchen HIIT', 'Jumping Jacks', 1, 3, 0, 30, 15),
    ('Quick Kitchen HIIT', 'Bodyweight Squats', 2, 3, 15, 0, 15),
    ('Quick Kitchen HIIT', 'Push-Ups', 3, 3, 8, 0, 15),
    ('Quick Kitchen HIIT', 'Plank', 4, 3, 0, 30, 15),

    ('Bodyweight Mass Builder', 'Push-Ups', 1, 4, 12, 0, 45),
    ('Bodyweight Mass Builder', 'Pistol Squat', 2, 3, 6, 0, 45),
    ('Bodyweight Mass Builder', 'Pull-Ups', 3, 4, 8, 0, 45),
    ('Bodyweight Mass Builder', 'Plank', 4, 3, 0, 45, 30)
) as x(ex_workout, ex_name, ord, sets, reps, dur, rest)
join public.exercises e on e.name = x.ex_name
where w.name = x.ex_workout
on conflict do nothing;
