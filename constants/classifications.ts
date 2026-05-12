export type Classification = {
  label: string;
  value: string;
};

export const CULINARY_CLASSIFICATIONS: Classification[] = [
  { label: "Appetizer / Starter", value: "appetizer" },
  { label: "Entrée / Main Course", value: "main" },
  { label: "Side Dish", value: "side" },
  { label: "Soup / Salad", value: "soup_salad" },
  { label: "Dessert", value: "dessert" },
  { label: "Beverage / Pairing", value: "beverage" },
  { label: "Amuse-Bouche", value: "amuse_bouche" },
];