import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FoodItem } from '../src/types';
import {
  getDietFlags,
  isFoodAllowed,
  filterFoodsByDiet,
} from '../src/services/recommendations/dietFilter';
import { recommendFoods } from '../src/services/recommendations/foodRecommendations';
import { FoodRecommendationContext } from '../src/types/recommendations';

function food(overrides: Partial<FoodItem>): FoodItem {
  return {
    id: 'x',
    name: 'x',
    category: 'General',
    serving_unit: 'serving',
    serving_size: 100,
    calories: 100,
    protein_g: 5,
    carbs_g: 10,
    fat_g: 2,
    fiber_g: 1,
    is_vegetarian: true,
    contains_egg: false,
    is_vegan: true,
    contains_dairy: false,
    contains_peanuts: false,
    contains_gluten: false,
    contains_soy: false,
    contains_seafood: false,
    description: '',
    ...overrides,
  };
}

test('getDietFlags for vegan holds all animal-derived', () => {
  const f = getDietFlags('vegan');
  assert.equal(f.hold_vegan, true);
  assert.equal(f.hold_egg, true);
  assert.equal(f.hold_dairy, true);
  assert.equal(f.hold_vegetarian, true);
});

test('getDietFlags for eggetarian allows eggs but holds meat', () => {
  const f = getDietFlags('eggetarian');
  assert.equal(f.hold_egg, false);
  assert.equal(f.hold_vegetarian, true);
  assert.equal(f.hold_seafood, true);
});

test('isFoodAllowed filters by dietary preference', () => {
  const chicken = food({ is_vegetarian: false, is_vegan: false });
  assert.equal(isFoodAllowed(chicken, 'vegetarian', []), false);
  assert.equal(isFoodAllowed(chicken, 'non_vegetarian', []), true);
});

test('isFoodAllowed respects explicit exclusions even for non-vegetarians', () => {
  const seafood = food({ contains_seafood: true, is_vegetarian: false, is_vegan: false });
  assert.equal(isFoodAllowed(seafood, 'non_vegetarian', []), true);
  assert.equal(isFoodAllowed(seafood, 'non_vegetarian', ['seafood']), false);
});

test('dairy/egg exclusions block matching foods', () => {
  const paneer = food({ contains_dairy: true, is_vegan: false });
  const eggs = food({ contains_egg: true, is_vegan: false, is_vegetarian: false });
  assert.equal(isFoodAllowed(paneer, 'none', ['dairy']), false);
  assert.equal(isFoodAllowed(paneer, 'vegan', []), false);
  assert.equal(isFoodAllowed(eggs, 'vegetarian', []), false); // vegetarian holds egg
  assert.equal(isFoodAllowed(eggs, 'eggetarian', ['eggs']), false); // explicit exclusion
});

test('filterFoodsByDiet returns only allowed foods', () => {
  const veg = food({ name: 'dal' });
  const meat = food({ name: 'chicken', is_vegetarian: false, is_vegan: false });
  const result = filterFoodsByDiet([veg, meat], 'vegetarian', []);
  assert.deepEqual(result.map((f) => f.name), ['dal']);
});

test('recommendFoods excludes foods that conflict with exclusions then ranks', () => {
  const dal = food({ name: 'dal', calories: 180, protein_g: 12, category: 'Dal & Legumes' });
  const chicken = food({ name: 'chicken', calories: 300, protein_g: 28, category: 'Protein', is_vegetarian: false, is_vegan: false });
  const paneer = food({ name: 'paneer', calories: 130, protein_g: 10, category: 'Protein', contains_dairy: true, is_vegan: false });

  const ctx: FoodRecommendationContext = {
    caloriesRemaining: 500,
    proteinRemaining: 30,
    goal: 'lose_weight',
    dietaryPreference: 'none',
    exclusions: ['dairy'],
    mealType: 'lunch',
  };

  const result = recommendFoods([dal, chicken, paneer], ctx, 10);
  const names = result.map((r) => r.food.name);
  assert.ok(!names.includes('paneer'), 'dairy food must be excluded');
  assert.ok(names.includes('dal') || names.includes('chicken'));
});

test('recommendFoods respects the limit', () => {
  const foods = Array.from({ length: 10 }, (_, i) => food({ name: `f${i}`, calories: 50 + i }));
  const ctx: FoodRecommendationContext = { caloriesRemaining: 1000, proteinRemaining: 0, goal: 'maintain', dietaryPreference: 'none', exclusions: [] };
  const result = recommendFoods(foods, ctx, 3);
  assert.equal(result.length, 3);
});
