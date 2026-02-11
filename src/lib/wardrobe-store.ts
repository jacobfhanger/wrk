import { ClothingItem } from "./types";

const DB_NAME = "wardrobe-db";
const DB_VERSION = 1;
const STORE_NAME = "items";
const LS_KEY = "wardrobe-items";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("category", "category", { unique: false });
        store.createIndex("addedAt", "addedAt", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function migrateFromLocalStorage(): Promise<void> {
  const data = localStorage.getItem(LS_KEY);
  if (!data) return;

  const items: ClothingItem[] = JSON.parse(data);
  if (items.length === 0) {
    localStorage.removeItem(LS_KEY);
    return;
  }

  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    for (const item of items) {
      store.put(item);
    }
    tx.oncomplete = () => {
      localStorage.removeItem(LS_KEY);
      resolve();
    };
    tx.onerror = () => resolve();
  });
}

let migrated = false;

async function ensureMigrated(): Promise<void> {
  if (migrated) return;
  migrated = true;
  try {
    await migrateFromLocalStorage();
  } catch {
    // localStorage might be empty or unavailable, that's fine
  }
}

export async function getWardrobe(): Promise<ClothingItem[]> {
  if (typeof window === "undefined") return [];
  await ensureMigrated();
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => {
      const items = request.result as ClothingItem[];
      items.sort((a, b) => b.addedAt.localeCompare(a.addedAt));
      resolve(items);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function addItem(item: ClothingItem): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.add(item);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

export async function removeItem(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getItemsByCategory(
  category: string
): Promise<ClothingItem[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const index = store.index("category");
    const request = index.getAll(category);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
