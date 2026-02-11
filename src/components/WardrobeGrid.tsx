"use client";

import { ClothingItem, ClothingCategory } from "@/lib/types";

interface WardrobeGridProps {
  items: ClothingItem[];
  onRemove: (id: string) => void;
  highlightIds?: string[];
}

const CATEGORY_LABELS: Record<ClothingCategory, string> = {
  tops: "tops",
  bottoms: "bottoms",
  dresses: "dresses",
  outerwear: "outerwear",
  shoes: "shoes",
  accessories: "accessories",
  activewear: "activewear",
  formal: "formal",
};

export default function WardrobeGrid({
  items,
  onRemove,
  highlightIds,
}: WardrobeGridProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <div
          className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #fce4ec, #ede7f6)' }}
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="#c3aed6"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
            />
          </svg>
        </div>
        <p className="text-lg font-medium" style={{ color: '#6b4c6e' }}>
          your closet is empty bestie
        </p>
        <p className="text-sm mt-1" style={{ color: '#b8879b' }}>
          upload some fits to get started
        </p>
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
          <h3 className="text-base font-medium mb-3" style={{ color: '#6b4c6e' }}>
            {CATEGORY_LABELS[category as ClothingCategory] || category}
            <span className="text-sm font-normal ml-2" style={{ color: '#c3aed6' }}>
              ({categoryItems.length})
            </span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {categoryItems.map((item) => (
              <div
                key={item.id}
                className={`group relative rounded-2xl overflow-hidden transition-all card-hover ${
                  highlightIds?.includes(item.id)
                    ? "ring-2 scale-105"
                    : ""
                }`}
                style={{
                  background: 'rgba(255, 255, 255, 0.6)',
                  border: highlightIds?.includes(item.id)
                    ? '2px solid #f0a6ca'
                    : '1px solid rgba(195, 174, 214, 0.25)',
                  ...(highlightIds?.includes(item.id)
                    ? { boxShadow: '0 0 20px rgba(240, 166, 202, 0.25)' }
                    : {}),
                }}
              >
                <div className="aspect-square" style={{ background: '#f8f0f5' }}>
                  <img
                    src={`data:image/jpeg;base64,${item.imageData}`}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-2.5">
                  <p className="text-sm font-medium truncate" style={{ color: '#6b4c6e' }}>
                    {item.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: item.color.toLowerCase(),
                        border: '1.5px solid rgba(195, 174, 214, 0.3)',
                      }}
                    />
                    <p className="text-xs truncate" style={{ color: '#b8879b' }}>
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
                    className="absolute top-2 right-2 w-7 h-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-sm text-white"
                    style={{ background: 'linear-gradient(135deg, #e879a8, #c3aed6)' }}
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
