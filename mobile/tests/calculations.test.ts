import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateBMI,
  calculateBMR,
  calculateTDEE,
  calorieAdjustment,
  calculateProtein,
  calculateWaterTarget,
  calculateTargets,
} from '../src/services/calculations';

const base = { age: 30, gender: 'male' as const, heightCm: 175, weightKg: 75, activityLevel: 'moderate' as const };

test('calculateBMI', () => {
  assert.equal(calculateBMI(75, 175), 75 / (1.75 * 1.75));
  assert.equal(calculateBMI(0, 175), 0);
  assert.equal(calculateBMI(75, 0), 0);
});

test('calculateBMR uses Mifflin-St Jeor for male', () => {
  // 10*75 + 6.25*175 - 5*30 + 5 = 750 + 1093.75 - 150 + 5 = 1698.75
  assert.equal(calculateBMR(base), 1698.75);
});

test('calculateBMR female subtracts 161', () => {
  // 1698.75 - 5 - 161 = 1532.75
  assert.equal(calculateBMR({ ...base, gender: 'female' }), 1532.75);
});

test('calculateBMR other uses -78', () => {
  assert.equal(calculateBMR({ ...base, gender: 'other' }), 1698.75 - 5 - 78);
});

test('calculateTDEE applies activity multiplier', () => {
  assert.equal(calculateTDEE(base), 1698.75 * 1.55);
});

test('calorieAdjustment per goal', () => {
  const tdee = 2000;
  assert.equal(calorieAdjustment(tdee, 'lose_weight'), Math.round(2000 - 0.2 * 2000)); // 1600
  assert.equal(calorieAdjustment(tdee, 'gain_weight'), Math.round(2000 + 0.15 * 2000)); // 2300
  assert.equal(calorieAdjustment(tdee, 'build_muscle'), Math.round(2000 + 0.05 * 2000)); // 2100
  assert.equal(calorieAdjustment(tdee, 'maintain'), 2000);
});

test('calculateProtein per goal', () => {
  assert.equal(calculateProtein(70, 'lose_weight'), 112); // 70 * 1.6
  assert.equal(calculateProtein(70, 'build_muscle'), 126); // 70 * 1.8
  assert.equal(calculateProtein(70, 'gain_weight'), 126);
  assert.equal(calculateProtein(70, 'maintain'), 84); // 70 * 1.2
});

test('calculateWaterTarget base plus activity bonus', () => {
  assert.equal(calculateWaterTarget(70, 'sedentary'), 70 * 33);
  assert.equal(calculateWaterTarget(70, 'light'), 70 * 33 + 200);
  assert.equal(calculateWaterTarget(70, 'moderate'), 70 * 33 + 400);
  assert.equal(calculateWaterTarget(70, 'very_active'), 70 * 33 + 600);
});

test('calculateTargets returns consistent full set', () => {
  const t = calculateTargets({ ...base, fitnessGoal: 'lose_weight' });
  assert.equal(t.bmi, calculateBMI(75, 175));
  assert.equal(t.bmr, calculateBMR(base));
  assert.equal(t.tdee, calculateTDEE(base));
  assert.equal(t.calorieTarget, calorieAdjustment(t.tdee, 'lose_weight'));
  assert.equal(t.proteinTarget, calculateProtein(75, 'lose_weight'));
  assert.equal(t.waterTargetMl, calculateWaterTarget(75, 'moderate'));
});

test('loss target is below TDEE and is a 20% reduction', () => {
  const t = calculateTargets({ ...base, fitnessGoal: 'lose_weight' });
  assert.ok(t.calorieTarget < t.tdee);
  assert.equal(t.calorieTarget, Math.round(t.tdee * 0.8));
});
