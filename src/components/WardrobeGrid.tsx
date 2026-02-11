"use client";

import { ClothingItem, ClothingCategory } from "@/lib/types";

interface WardrobeGridProps {
  items: ClothingItem[];
  onRemove: (id: string) => void;
  highlightIds?: string[];
}

const CATEGORY_LABELS: Record<ClothingCategory, string> = {
  tops: "Tops",
  bottoms: "Bottoms",
  dresses: "Dresses",
  outerwear: "Outerwear",
  shoes: "Shoes",
  accessories: "Accessories",
  activewear: "Activewear",
  formal: "Formal",
};

export default function WardrobeGrid({
  items,
  onRemove,
  highlightIds,
}: WardrobeGridProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <svg
          className="w-16 h-16 mx-auto mb-4 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
          />
        </svg>
        <p className="text-lg font-medium">Your wardrobe is empty</p>
        <p className="text-sm mt-1">Upload photos of your clothes to get started</p>
      </div>
    );
  }

  const grouped = items.reduce(
    (acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, ClothingItem[]>
  );

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([category, categoryItems]) => (
        <div key={category}>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            {CATEGORY_LABELS[category as ClothingCategory] || category}
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({categoryItems.length})
            </span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {categoryItems.map((item) => (
              <div
                key={item.id}
                className={`group relative rounded-xl overflow-hidden border transition-all ${
                  highlightIds?.includes(item.id)
                    ? "border-indigo-500 ring-2 ring-indigo-200 scale-105"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="aspect-square bg-gray-100">
                  <img
                    src={`data:image/jpeg;base64,${item.imageData}`}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-2.5">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {item.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span
                      className="w-3 h-3 rounded-full border border-gray-200 flex-shrink-0"
                      style={{ backgroundColor: item.color.toLowerCase() }}
                    />
                    <p className="text-xs text-gray-500 truncate">
                      {item.color} &middot; {item.style}
                    </p>
                  </div>
                </div>
                {!highlightIds && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(item.id);
                    }}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-sm"
                    title="Remove item"
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
