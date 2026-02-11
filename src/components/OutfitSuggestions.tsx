"use client";

import { useState } from "react";
import { ClothingItem, Occasion, Season } from "@/lib/types";

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
  const [activeOutfit, setActiveOutfit] = useState<number | null>(null);

  async function getSuggestions() {
    if (wardrobe.length < 2) {
      setError("add at least 2 pieces to get outfit inspo!");
      return;
    }

    setLoading(true);
    setError(null);
    setSuggestions([]);
    setActiveOutfit(null);
    onHighlight([]);

    try {
      const res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wardrobe,
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

  function handleOutfitClick(index: number, itemIds: string[]) {
    if (activeOutfit === index) {
      setActiveOutfit(null);
      onHighlight([]);
    } else {
      setActiveOutfit(index);
      onHighlight(itemIds);
    }
  }

  function getItemName(id: string): string {
    return wardrobe.find((i) => i.id === id)?.name || "Unknown item";
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
        <div className="space-y-3">
          {suggestions.map((outfit, index) => (
            <div
              key={index}
              onClick={() => handleOutfitClick(index, outfit.itemIds)}
              className="p-4 rounded-2xl cursor-pointer transition-all card-hover"
              style={{
                background: activeOutfit === index
                  ? 'rgba(240, 166, 202, 0.12)'
                  : 'rgba(255, 255, 255, 0.5)',
                border: activeOutfit === index
                  ? '1.5px solid rgba(240, 166, 202, 0.5)'
                  : '1px solid rgba(195, 174, 214, 0.2)',
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium" style={{ color: '#6b4c6e' }}>
                    {outfit.description}
                  </h4>
                  <p className="text-xs mt-0.5" style={{ color: '#e879a8' }}>
                    {outfit.occasion}
                  </p>
                </div>
                <span
                  className="text-xs px-2.5 py-1 rounded-full"
                  style={{
                    background: activeOutfit === index
                      ? 'linear-gradient(135deg, #fce4ec, #ede7f6)'
                      : 'rgba(195, 174, 214, 0.15)',
                    color: '#9b7ba3',
                  }}
                >
                  {outfit.itemIds.length} pieces
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {outfit.itemIds.map((id) => (
                  <span
                    key={id}
                    className="text-xs px-2.5 py-0.5 rounded-full"
                    style={{
                      background: 'rgba(195, 174, 214, 0.15)',
                      color: '#7b5e80',
                    }}
                  >
                    {getItemName(id)}
                  </span>
                ))}
              </div>
              <p className="text-sm mt-2" style={{ color: '#9b7ba3' }}>
                {outfit.reasoning}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
