-- FitWell seed: exercises
-- Category relates to workout placement; muscle_group/target the body area.

insert into public.exercises
  (name, category, muscle_group, difficulty, equipment, instructions, duration_minutes, estimated_calories)
values
  ('Push-Ups', 'Strength', 'Chest', 'beginner', 'None', 'Start in a high plank with hands under shoulders. Lower your chest to the floor, then press back up, keeping your body straight.', 5, 30),
  ('Bodyweight Squats', 'Strength', 'Legs', 'beginner', 'None', 'Stand with feet shoulder-width apart. Push hips back and bend knees to lower, then drive back up through your heels.', 5, 40),
  ('Lunges', 'Strength', 'Legs', 'beginner', 'None', 'Step forward and lower until both knees are bent at 90 degrees, then push back to start. Alternate legs.', 5, 40),
  ('Plank', 'Core', 'Core', 'beginner', 'None', 'Hold a forearm plank with body in a straight line from head to heels. Keep core braced.', 3, 20),
  ('Glute Bridge', 'Strength', 'Glutes', 'beginner', 'None', 'Lie on your back with knees bent. Drive hips up squeezing glutes, then lower slowly.', 4, 25),
  ('Mountain Climbers', 'Cardio', 'Core', 'beginner', 'None', 'In a high plank, drive knees toward chest alternately at a fast pace.', 4, 45),
  ('High Knees', 'Cardio', 'Legs', 'beginner', 'None', 'Run in place driving knees to hip height, swinging arms. Keep cadence brisk.', 3, 40),
  ('Jumping Jacks', 'Cardio', 'Full body', 'beginner', 'None', 'Jump feet out while raising arms overhead, then return. Repeat rhythmically.', 3, 35),
  ('Dumbbell Bicep Curl', 'Strength', 'Arms', 'beginner', 'Dumbbells', 'Hold dumbbells at your sides, curl up toward shoulders, then lower slowly.', 5, 30),
  ('Dumbbell Shoulder Press', 'Strength', 'Shoulders', 'intermediate', 'Dumbbells', 'Press dumbbells from shoulder height overhead until arms are straight, then lower.', 5, 40),
  ('Dumbbell Row', 'Strength', 'Back', 'intermediate', 'Dumbbells', 'Hinge forward, row a dumbbell toward your hip keeping elbow close, then lower.', 5, 45),
  ('Deadlift', 'Strength', 'Back', 'intermediate', 'Barbell', 'Hinge at hips to grip the bar, drive hips forward to stand tall, then lower with a flat back.', 6, 70),
  ('Bench Press', 'Strength', 'Chest', 'intermediate', 'Barbell', 'Lower a barbell to mid-chest with control, then press up to full arm extension.', 6, 60),
  ('Tricep Dips', 'Strength', 'Arms', 'intermediate', 'Bench', 'Support yourself on a bench, lower your body by bending elbows, then press back up.', 4, 35),
  ('Russian Twists', 'Core', 'Core', 'beginner', 'None', 'Seated with feet lifted, rotate torso side to side holding hands together.', 4, 30),
  ('Burpees', 'Cardio', 'Full body', 'advanced', 'None', 'Drop to plank, kick feet back, push-up, jump feet forward, then jump up. Repeat explosively.', 5, 70),
  ('Pistol Squat', 'Strength', 'Legs', 'advanced', 'None', 'Stand on one leg and lower into a single-leg squat, then press back up.', 5, 50),
  ('Pull-Ups', 'Strength', 'Back', 'advanced', 'Pull-up bar', 'Hang from the bar and pull up until your chin clears it, then lower with control.', 6, 60),
  ('Jump Squats', 'Cardio', 'Legs', 'intermediate', 'None', 'Squat down then jump explosively, landing softly and repeating.', 4, 50),
  ('Calf Raises', 'Strength', 'Calves', 'beginner', 'None', 'Stand tall and rise onto your toes, hold briefly, then lower. Repeat standing on a step for range.', 4, 20),
  ('Surya Namaskar (Sun Salute)', 'Mobility', 'Full body', 'beginner', 'None', 'Flow through a sequence of 12 yoga poses linking breath with movement.', 10, 60),
  ('Skipping (Jump Rope)', 'Cardio', 'Full body', 'beginner', 'Rope', 'Jump rope at a steady pace, landing softly on the balls of your feet.', 5, 70);
