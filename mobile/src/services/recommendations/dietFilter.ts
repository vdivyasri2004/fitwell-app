import { DietFlags } from '../../types/recommendations';
import { DietaryPreference } from '../../types';

export interface FoodDietFlags {
  is_vegetarian: boolean;
  contains_egg: boolean;
  is_vegan: boolean;
  contains_dairy: boolean;
  contains_peanuts: boolean;
  contains_gluten: boolean;
  contains_soy: boolean;
  contains_seafood: boolean;
}

/**
 * Returns valid dietary flags depending on the user's dietary preference.
 * This is a pure helper used to filter foods.
 */
export function getDietFlags(preference: DietaryPreference): DietFlags {
  switch (preference) {
    case 'vegan':
      return {
        hold_vegetarian: true,
        hold_egg: true,
        hold_vegan: true,
        hold_dairy: true,
        hold_peanuts: false,
        hold_gluten: false,
        hold_soy: false,
        hold_seafood: true,
      };
    case 'vegetarian':
      return {
        hold_vegetarian: true,
        hold_egg: true,
        hold_vegan: false,
        hold_dairy: false,
        hold_peanuts: false,
        hold_gluten: false,
        hold_soy: false,
        hold_seafood: true,
      };
    case 'eggetarian':
      return {
        hold_vegetarian: true,
        hold_egg: false,
        hold_vegan: false,
        hold_dairy: false,
        hold_peanuts: false,
        hold_gluten: false,
        hold_soy: false,
        hold_seafood: true,
      };
    case 'non_vegetarian':
    case 'none':
    default:
      return {
        hold_vegetarian: false,
        hold_egg: false,
        hold_vegan: false,
        hold_dairy: false,
        hold_peanuts: false,
        hold_gluten: false,
        hold_soy: false,
        hold_seafood: false,
      };
  }
}

/**
 * Determines whether a food is allowed given dietary preference and explicit exclusions.
 * Never recommend food that conflicts with an explicit exclusion.
 */
export function isFoodAllowed(
  food: FoodDietFlags,
  preference: DietaryPreference,
  exclusions: string[],
): boolean {
  const flags = getDietFlags(preference);
  if (flags.hold_vegan && !food.is_vegan) return false;
  if (flags.hold_vegetarian && !food.is_vegetarian) return false;
  if (flags.hold_egg && food.contains_egg) return false;
  if (flags.hold_dairy && food.contains_dairy) return false;
  if (flags.hold_seafood && food.contains_seafood) return false;

  const exclusionSet = new Set(exclusions.map((e) => e.toLowerCase()));
  if (exclusionSet.has('eggs') && food.contains_egg) return false;
  if (exclusionSet.has('dairy') && food.contains_dairy) return false;
  if (exclusionSet.has('peanuts') && food.contains_peanuts) return false;
  if (exclusionSet.has('gluten') && food.contains_gluten) return false;
  if (exclusionSet.has('soy') && food.contains_soy) return false;
  if (exclusionSet.has('seafood') && food.contains_seafood) return false;
  return true;
}

export function filterFoodsByDiet(
  foods: FoodDietFlags[],
  preference: DietaryPreference,
  exclusions: string[],
): FoodDietFlags[] {
  return foods.filter((f) => isFoodAllowed(f, preference, exclusions));
}
