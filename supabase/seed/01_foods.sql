-- FitWell seed: food items
-- Approximate nutrition per single serving (as listed). Values are estimates for
-- MVP display; the app uses "estimated daily target" language. Categories match
-- the mobile recommendation engine's meal categories.

insert into public.food_items
  (name, category, serving_unit, serving_size, calories, protein_g, carbs_g, fat_g, fiber_g,
   is_vegetarian, contains_egg, is_vegan, contains_dairy, contains_peanuts, contains_gluten, contains_soy, contains_seafood, description)
values
  -- Breakfast
  ('Masala Oats', 'Breakfast', 'bowl', 100, 140, 5, 22, 4, 4, true, false, true, false, false, true, false, false, 'Rolled oats cooked with vegetables, mild Indian spices.'),
  ('Vegetable Poha', 'Breakfast', 'plate', 150, 220, 5, 38, 6, 3, true, false, true, false, false, true, false, false, 'Flattened rice cooked with peas, peanuts and turmeric.'),
  ('Idli (2 pcs)', 'Breakfast', 'pieces', 40, 80, 2, 17, 0.5, 1, true, false, true, false, false, false, false, false, 'Steamed fermented rice and lentil cakes.'),
  ('Masala Dosa', 'Breakfast', 'piece', 150, 350, 7, 55, 12, 4, true, false, true, false, false, true, false, false, 'Crispy fermented crepe with spiced potato filling.'),
  ('Vegetable Upma', 'Breakfast', 'bowl', 180, 240, 6, 42, 6, 4, true, false, true, false, false, true, false, false, 'Semolina cooked with vegetables.'),
  ('Besan Chilla', 'Breakfast', 'piece', 80, 160, 8, 18, 6, 3, true, false, true, false, false, true, true, false, 'Chickpea flour savoury pancake.'),
  ('Moong Dal Chilla', 'Breakfast', 'piece', 90, 170, 10, 22, 4, 4, true, false, true, false, false, false, false, false, 'Green gram lentil pancake, high protein.'),
  ('Whole Wheat Roti', 'Breakfast', 'piece', 40, 120, 4, 22, 2, 3, true, false, true, false, false, true, false, false, 'Whole wheat flatbread.'),
  ('Boiled Egg (1)', 'Breakfast', 'egg', 50, 78, 6, 0.6, 5, 0, false, true, false, false, false, false, false, false, 'Large hard boiled egg.'),
  ('Omelette (2 eggs)', 'Breakfast', 'omelette', 100, 180, 13, 2, 13, 0, false, true, false, false, false, false, false, false, 'Two-egg omelette, lightly cooked.'),
  ('Banana (1)', 'Fruits', 'medium', 120, 105, 1.3, 27, 0.3, 3.1, true, false, true, false, false, false, false, false, 'Fresh medium banana.'),
  ('Apple (1)', 'Fruits', 'medium', 180, 95, 0.5, 25, 0.3, 4.4, true, false, true, false, false, false, false, false, 'Fresh medium apple.'),
  ('Papaya (1 cup)', 'Fruits', 'cup', 140, 55, 0.9, 14, 0.2, 2.5, true, false, true, false, false, false, false, false, 'Diced papaya.'),
  ('Guava (1)', 'Fruits', 'medium', 100, 68, 2.6, 14, 1, 5.4, true, false, true, false, false, false, false, false, 'Fresh guava, rich in vitamin C.'),
  ('Mango (1 cup)', 'Fruits', 'cup', 165, 100, 0.8, 25, 0.6, 2.6, true, false, true, false, false, false, false, false, 'Diced ripe mango.'),
  ('Orange (1)', 'Fruits', 'medium', 130, 62, 1.2, 15, 0.2, 3.1, true, false, true, false, false, false, false, false, 'Fresh medium orange.'),
  -- Dairy
  ('Milk (1 glass)', 'Dairy', 'glass', 250, 120, 8, 12, 5, 0, true, false, false, true, false, false, false, false, 'Full cream cow milk.'),
  ('Low-Fat Curd (1 cup)', 'Dairy', 'cup', 245, 100, 10, 11, 2, 0, true, false, false, true, false, false, false, false, 'Plain low-fat yogurt.'),
  ('Paneer (50g)', 'Dairy', 'serving', 50, 130, 10, 2, 9, 0, true, false, false, true, false, false, false, false, 'Indian cottage cheese.'),
  ('Buttermilk (1 glass)', 'Dairy', 'glass', 200, 40, 2, 5, 1, 0, true, false, false, true, false, false, false, false, 'Salted spiced buttermilk.'),
  ('Greek Yogurt (1 cup)', 'Dairy', 'cup', 200, 130, 22, 9, 0.5, 0, true, false, false, true, false, false, false, false, 'Thick strained yogurt, high protein.'),
  -- Grains
  ('Steamed Rice (1 cup)', 'Grains', 'cup', 160, 205, 4, 45, 0.5, 0.6, true, false, true, false, false, false, false, false, 'Cooked white basmati rice.'),
  ('Brown Rice (1 cup)', 'Grains', 'cup', 160, 216, 5, 45, 1.8, 3.5, true, false, true, false, false, false, false, false, 'Cooked brown rice, higher fibre.'),
  ('Jowar Bhakri (1)', 'Grains', 'piece', 60, 150, 3, 31, 1.5, 3, true, false, true, false, false, false, false, false, 'Gluten-free sorghum flatbread.'),
  ('Oats (dry 50g)', 'Grains', 'serving', 50, 190, 7, 33, 3.5, 5, true, false, true, false, false, true, false, false, 'Dry rolled oats.'),
  -- Dal & Legumes
  ('Masoor Dal (1 bowl)', 'Dal & Legumes', 'bowl', 200, 160, 12, 22, 4, 6, true, false, true, false, false, false, false, false, 'Cooked red lentil dal.'),
  ('Moong Dal (1 bowl)', 'Dal & Legumes', 'bowl', 200, 180, 14, 28, 2, 8, true, false, true, false, false, false, false, false, 'Cooked split green gram dal.'),
  ('Chana Masala (1 cup)', 'Main Course', 'cup', 240, 270, 12, 38, 8, 11, true, false, true, false, false, false, true, false, 'Chickpea curry.'),
  ('Rajma (1 cup)', 'Main Course', 'cup', 230, 250, 13, 35, 7, 12, true, false, true, false, false, false, false, false, 'Kidney bean curry.'),
  ('Sambar (1 bowl)', 'Main Course', 'bowl', 200, 120, 6, 22, 2, 8, true, false, true, false, false, false, false, false, 'South Indian lentil-vegetable stew.'),
  -- Vegetables
  ('Mixed Vegetable Sabzi', 'Vegetables', 'bowl', 200, 150, 4, 18, 8, 6, true, false, true, false, false, false, false, false, 'Stir-fried seasonal vegetables.'),
  ('Palak (1 bowl)', 'Vegetables', 'bowl', 180, 100, 5, 10, 5, 4, true, false, true, false, false, false, false, false, 'Cooked spinach with light tempering.'),
  ('Broccoli (1 cup)', 'Vegetables', 'cup', 90, 55, 3.7, 11, 0.5, 2.4, true, false, true, false, false, false, false, false, 'Steamed broccoli.'),
  ('Cabbage Salad (1 bowl)', 'Vegetables', 'bowl', 150, 60, 2, 10, 1, 5, true, false, true, false, false, false, false, false, 'Shredded cabbage with lemon.'),
  ('Beetroot (1 cup)', 'Vegetables', 'cup', 135, 60, 2.2, 13, 0.2, 3.8, true, false, true, false, false, false, false, false, 'Cooked beetroot cubes.'),
  -- Protein
  ('Chicken Curry (1 cup)', 'Protein', 'cup', 220, 300, 28, 8, 18, 1, false, false, false, false, false, false, false, false, 'Chicken in tomato-onion gravy.'),
  ('Grilled Chicken Breast (100g)', 'Protein', 'serving', 100, 165, 31, 0, 3.6, 0, false, false, false, false, false, false, false, false, 'Lean grilled chicken breast.'),
  ('Egg Bhurji (2 eggs)', 'Protein', 'serving', 120, 220, 15, 4, 16, 1, false, true, false, false, false, true, false, false, 'Indian-style scrambled eggs.'),
  ('Fish Curry (1 cup)', 'Protein', 'cup', 240, 230, 26, 6, 12, 1, false, false, false, false, false, false, false, true, 'Fish simmered in coconut curry.'),
  ('Chicken Biryani (1 plate)', 'Main Course', 'plate', 350, 480, 28, 60, 15, 3, false, false, false, false, false, true, false, false, 'Spiced rice with chicken.'),
  ('Soya Chunks (1 cup)', 'Protein', 'cup', 100, 150, 17, 10, 5, 6, true, false, true, false, false, false, true, false, 'Cooked textured soy protein curry.'),
  ('Tofu (100g)', 'Protein', 'serving', 100, 76, 8, 2, 4.8, 0.3, true, false, true, false, false, false, true, false, 'Firm tofu, high plant protein.'),
  ('Lentil Soup (1 bowl)', 'Dal & Legumes', 'bowl', 250, 140, 10, 24, 2, 8, true, false, true, false, false, false, false, false, 'Brothy red lentil soup.'),
  -- Snacks
  ('Roasted Chana (1/2 cup)', 'Snacks', 'serving', 45, 175, 8, 29, 3, 6, true, false, true, false, false, false, false, false, 'Roasted chickpeas.'),
  ('Dhokla (2 pcs)', 'Snacks', 'pieces', 80, 130, 4, 22, 3, 2, true, false, true, false, false, true, false, false, 'Steamed fermented gram flour cakes.'),
  ('Makhana (1 cup)', 'Nuts & Seeds', 'cup', 20, 70, 2, 14, 0.5, 1, true, false, true, false, false, false, false, false, 'Roasted fox nut / lotus seeds.'),
  ('Moong Sprouts Salad (1 bowl)', 'Snacks', 'bowl', 120, 130, 10, 22, 1, 6, true, false, true, false, false, false, false, false, 'Fresh mung bean sprouts with lemon.'),
  ('Almonds (10)', 'Nuts & Seeds', 'serving', 12, 70, 2.5, 2.5, 6, 1.5, true, false, true, false, false, false, false, false, 'Raw almonds.'),
  ('Walnuts (5 halves)', 'Nuts & Seeds', 'serving', 15, 100, 2.3, 2.6, 9, 1, true, false, true, false, false, false, false, false, 'Raw walnut halves.'),
  ('Peanut Chikki (1 pc)', 'Snacks', 'piece', 25, 120, 4, 14, 6, 2, true, false, true, false, true, false, false, false, 'Jaggery-peanut brittle.'),
  ('Veg Poha Chivda (1/2 cup)', 'Snacks', 'serving', 30, 110, 2, 18, 4, 1, true, false, true, false, false, true, false, false, 'Lightly spiced flattened-rice snack.'),
  ('Fruit Salad (1 bowl)', 'Snacks', 'bowl', 180, 120, 1.5, 30, 0.5, 4, true, false, true, false, false, false, false, false, 'Mixed seasonal fruits.'),
  -- Additional mains
  ('Dal Tadka (1 bowl)', 'Main Course', 'bowl', 220, 190, 13, 24, 5, 7, true, false, true, false, false, false, false, false, 'Toor dal tempered with ghee and spices.'),
  ('Paneer Bhurji (1 cup)', 'Main Course', 'cup', 200, 280, 16, 8, 20, 2, true, false, false, true, false, true, false, false, 'Scrambled paneer with vegetables.'),
  ('Vegetable Khichdi (1 bowl)', 'Main Course', 'bowl', 250, 220, 8, 38, 6, 6, true, false, true, false, false, false, false, false, 'Rice and lentil one-pot comfort meal.')
;
