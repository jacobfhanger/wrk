export interface ClothingItem {
  id: string;
  name: string;
  brand?: string;
  category: ClothingCategory;
  color: string;
  style: string;
  material: string;
  season: Season[];
  occasion: Occasion[];
  imageData: string; // base64 encoded image
  addedAt: string;
}

export type ClothingCategory =
  | "tops"
  | "bottoms"
  | "dresses"
  | "outerwear"
  | "shoes"
  | "accessories"
  | "activewear"
  | "formal";

export type Season = "spring" | "summer" | "fall" | "winter";

export type Occasion =
  | "casual"
  | "work"
  | "formal"
  | "date"
  | "athletic"
  | "outdoor";

export interface OutfitSuggestion {
  items: ClothingItem[];
  description: string;
  occasion: string;
  reasoning: string;
}

export interface AnalysisResult {
  name: string;
  brand?: string;
  category: ClothingCategory;
  color: string;
  style: string;
  material: string;
  season: Season[];
  occasion: Occasion[];
}
