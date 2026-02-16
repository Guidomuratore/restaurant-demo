export interface MenuExtra {
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  ingredients?: string[]; // List of removes-able ingredients
  extras?: MenuExtra[];   // List of add-ons
}

export interface CartItem extends MenuItem {
  quantity: number;
  selectedExtras?: MenuExtra[];
  removedIngredients?: string[];
  notes?: string;
  uuid?: string; // Unique ID for cart item to distinguish customizations
}
