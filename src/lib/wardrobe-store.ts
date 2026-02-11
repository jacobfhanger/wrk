import { ClothingItem } from "./types";

const STORAGE_KEY = "wardrobe-items";

export function getWardrobe(): ClothingItem[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function addItem(item: ClothingItem): boolean {
  const items = getWardrobe();
  items.push(item);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    return true;
  } catch {
    // QuotaExceededError - storage is full
    return false;
  }
}

export function removeItem(id: string): void {
  const items = getWardrobe().filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function getItemsByCategory(category: string): ClothingItem[] {
  return getWardrobe().filter((item) => item.category === category);
}
