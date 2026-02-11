"use client";

import { useState } from "react";
import { ClothingItem, Occasion, Season } from "@/lib/types";
import { resolveColor, getImageSrc } from "@/lib/colors";

interface OutfitSuggestion {
  itemIds: string[];
  description: string;
  occasion: string;
  reasoning: string;
}

interface OutfitSuggestionsProps {
  wardrobe: ClothingItem[];
  onHighlight: (ids: string[]) => void;
}

const OCCASIONS: { value: Occasion | ""; label: string }[] = [
  { value: "", label: "any vibe" },
  { value: "casual", label: "casual" },
  { value: "work", label: "work" },
  { value: "formal", label: "formal" },
  { value: "date", label: "date night" },
  { value: "athletic", label: "athletic" },
  { value: "outdoor", label: "outdoor" },
];

const SEASONS: { value: Season | ""; label: string }[] = [
  { value: "", label: "any season" },
  { value: "spring", label: "spring" },
  { value: "summer", label: "summer" },
  { value: "fall", label: "fall" },
  { value: "winter", label: "winter" },
];

function MoodBoardCollage({ items }: { items: ClothingItem[] }) {
  if (items.length === 0) return null;

  if (items.length === 1) {
    return (
      <div className="grid grid-cols-1 gap-1.5 aspect-[4/3]">
        <div className="rounded-xl overflow-hidden" style={{ background: '#f8f0f5' }}>
          <img
            src={getImageSrc(items[0].imageData)}
            alt={items[0].name}
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    );
  }

  if (items.length === 2) {
    return (
      <div className="grid grid-cols-2 gap-1.5 aspect-[4/3]">
        {items.map((item) => (
          <div key={item.id} className="rounded-xl overflow-hidden" style={{ background: '#f8f0f5' }}>
            <img
              src={getImageSrc(item.imageData)}
              alt={item.name}
              className="w-full h-full object-contain"
            />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 3) {
    return (
      <div className="grid grid-cols-2 grid-rows-2 gap-1.5 aspect-[4/3]">
        <div className="row-span-2 rounded-xl overflow-hidden" style={{ background: '#f8f0f5' }}>
          <img
            src={getImageSrc(items[0].imageData)}
            alt={items[0].name}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="rounded-xl overflow-hidden" style={{ background: '#f8f0f5' }}>
          <img
            src={getImageSrc(items[1].imageData)}
            alt={items[1].name}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="rounded-xl overflow-hidden" style={{ background: '#f8f0f5' }}>
          <img
            src={getImageSrc(items[2].imageData)}
            alt={items[2].name}
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    );
  }

  // 4+ items: 2x2 grid, extras hidden
  const shown = items.slice(0, 4);
  const extra = items.length - 4;
  return (
    <div className="grid grid-cols-2 grid-rows-2 gap-1.5 aspect-[4/3]">
      {shown.map((item, i) => (
        <div key={item.id} className="relative rounded-xl overflow-hidden" style={{ background: '#f8f0f5' }}>
          <img
            src={getImageSrc(item.imageData)}
            alt={item.name}
            className="w-full h-full object-contain"
          />
          {i === 3 && extra > 0 && (
            <div
              className="absolute inset-0 flex items-center justify-center rounded-xl"
              style={{ background: 'rgba(107, 76, 110, 0.55)' }}
            >
              <span className="text-white text-lg font-semibold">+{extra}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function OutfitSuggestions({
  wardrobe,
  onHighlight,
}: OutfitSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<OutfitSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [occasion, setOccasion] = useState("");
  const [season, setSeason] = useState("");
  const [preferences, setPreferences] = useState("");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  async function getSuggestions() {
    if (wardrobe.length < 2) {
      setError("add at least 2 pieces to get outfit inspo!");
      return;
    }

    setLoading(true);
    setError(null);
    setSuggestions([]);
    setExpandedIndex(null);
    onHighlight([]);

    try {
      const res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wardrobe: wardrobe.map(({ imageData, ...rest }) => rest),
          occasion: occasion || undefined,
          season: season || undefined,
          preferences: preferences || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to get suggestions");
      }

      const data = await res.json();
      setSuggestions(data.suggestions);
    } catch {
      setError("couldn't get suggestions rn, try again?");
    } finally {
      setLoading(false);
    }
  }

  function getOutfitItems(itemIds: string[]): ClothingItem[] {
    return itemIds
      .map((id) => wardrobe.find((i) => i.id === id))
      .filter((item): item is ClothingItem => item !== undefined);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <select
          value={occasion}
          onChange={(e) => setOccasion(e.target.value)}
          className="rounded-xl px-3 py-2.5 text-sm transition-all outline-none"
          style={{
            background: 'rgba(255, 255, 255, 0.5)',
            border: '1px solid rgba(195, 174, 214, 0.3)',
            color: '#6b4c6e',
          }}
        >
          {OCCASIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={season}
          onChange={(e) => setSeason(e.target.value)}
          className="rounded-xl px-3 py-2.5 text-sm transition-all outline-none"
          style={{
            background: 'rgba(255, 255, 255, 0.5)',
            border: '1px solid rgba(195, 174, 214, 0.3)',
            color: '#6b4c6e',
          }}
        >
          {SEASONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={preferences}
          onChange={(e) => setPreferences(e.target.value)}
          placeholder="e.g. 'something cozy'"
          className="rounded-xl px-3 py-2.5 text-sm transition-all outline-none"
          style={{
            background: 'rgba(255, 255, 255, 0.5)',
            border: '1px solid rgba(195, 174, 214, 0.3)',
            color: '#6b4c6e',
          }}
        />
      </div>

      <button
        onClick={getSuggestions}
        disabled={loading || wardrobe.length < 2}
        className="w-full py-3 px-4 btn-gradient text-white rounded-2xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span
              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
            />
            styling your looks...
          </span>
        ) : (
          "get outfit inspo"
        )}
      </button>

      {error && (
        <div
          className="p-3 rounded-xl text-sm"
          style={{ background: '#fce4ec', color: '#c0627e' }}
        >
          {error}
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {suggestions.map((outfit, index) => {
            const outfitItems = getOutfitItems(outfit.itemIds);
            const isExpanded = expandedIndex === index;

            return (
              <div
                key={index}
                className="rounded-2xl overflow-hidden transition-all card-hover cursor-pointer"
                style={{
                  background: 'rgba(255, 255, 255, 0.65)',
                  border: '1px solid rgba(195, 174, 214, 0.25)',
                }}
                onClick={() => setExpandedIndex(isExpanded ? null : index)}
              >
                {/* Image collage */}
                <MoodBoardCollage items={outfitItems} />

                {/* Color palette */}
                <div className="flex items-center gap-1.5 px-4 pt-3">
                  {outfitItems.map((item) => (
                    <span
                      key={item.id}
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      title={item.color}
                      style={{
                        backgroundColor: resolveColor(item.color),
                        border: '1.5px solid rgba(255, 255, 255, 0.8)',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      }}
                    />
                  ))}
                </div>

                {/* Info */}
                <div className="px-4 pt-2 pb-3">
                  <h4 className="font-medium text-sm" style={{ color: '#6b4c6e' }}>
                    {outfit.description}
                  </h4>
                  <span
                    className="inline-block text-xs px-2 py-0.5 rounded-full mt-1"
                    style={{ background: 'linear-gradient(135deg, #fce4ec, #ede7f6)', color: '#9b7ba3' }}
                  >
                    {outfit.occasion}
                  </span>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div
                    className="px-4 pb-4 space-y-3"
                    style={{ borderTop: '1px solid rgba(195, 174, 214, 0.15)' }}
                  >
                    <p className="text-xs pt-3" style={{ color: '#9b7ba3' }}>
                      {outfit.reasoning}
                    </p>

                    {/* Item list */}
                    <div className="space-y-1.5">
                      {outfitItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0"
                            style={{ background: '#f8f0f5' }}
                          >
                            <img
                              src={getImageSrc(item.imageData)}
                              alt={item.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium truncate" style={{ color: '#6b4c6e' }}>
                              {item.brand ? `${item.brand} ` : ""}{item.name}
                            </p>
                            <p className="text-[10px] truncate" style={{ color: '#b8879b' }}>
                              {item.color} &middot; {item.category}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* View in closet button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onHighlight(outfit.itemIds);
                      }}
                      className="w-full py-2 rounded-xl text-xs font-medium transition-all"
                      style={{
                        background: 'rgba(195, 174, 214, 0.15)',
                        color: '#9b7ba3',
                      }}
                    >
                      view in closet
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
