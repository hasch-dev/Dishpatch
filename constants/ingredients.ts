export type Ingredient = {
  id: string;
  name: string;
  category: 'Proteins' | 'Produce' | 'Dairy' | 'Pantry' | 'Nuts' | 'Grains';
  isAllergen: boolean;
  allergenType?: string;
};

export const INGREDIENTS_REGISTRY: Ingredient[] = [
  { id: "1", name: "Wagyu Beef", category: "Proteins", isAllergen: false },
  { id: "2", name: "Heavy Cream", category: "Dairy", isAllergen: true, allergenType: "Lactose" },
  { id: "3", name: "Truffle Oil", category: "Pantry", isAllergen: false },
  { id: "4", name: "Peanuts", category: "Nuts", isAllergen: true, allergenType: "Peanut" },
  { id: "5", name: "Atlantic Salmon", category: "Proteins", isAllergen: true, allergenType: "Fish" },
  { id: "6", name: "Goat Cheese", category: "Dairy", isAllergen: true, allergenType: "Lactose" },
  { id: "7", name: "Sourdough Starter", category: "Grains", isAllergen: true, allergenType: "Gluten" }
];