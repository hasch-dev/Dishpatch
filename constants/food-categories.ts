export type FoodCategory = {
  value: 'meat' | 'seafood' | 'produce' | 'grain' | 'dessert';
  label: string;
  code: string;
};

export const FOOD_CATEGORIES: FoodCategory[] = [
  { value: "meat", label: "Meat & Poultry", code: "MAT" },
  { value: "seafood", label: "Fish & Shellfish", code: "SFD" },
  { value: "produce", label: "Vegetables & Fruit", code: "VFT" },
  { value: "grain", label: "Grains & Pasta", code: "GRN" },
  { value: "dessert", label: "Sweets & Pastry", code: "SWT" },
] as const;