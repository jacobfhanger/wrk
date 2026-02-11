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
  { value: "", label: "Any occasion" },
  { value: "casual", label: "Casual" },
  { value: "work", label: "Work" },
  { value: "formal", label: "Formal" },
  { value: "date", label: "Date night" },
  { value: "athletic", label: "Athletic" },
  { value: "outdoor", label: "Outdoor" },
];

const SEASONS: { value: Season | ""; label: string }[] = [
  { value: "", label: "Any season" },
  { value: "spring", label: "Spring" },
  { value: "summer", label: "Summer" },
  { value: "fall", label: "Fall" },
  { value: "winter", label: "Winter" },
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
      setError("Add at least 2 items to your wardrobe to get outfit suggestions.");
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
      setError("Failed to generate outfit suggestions. Please try again.");
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
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
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
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
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
          placeholder="e.g. 'something colorful'"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <button
        onClick={getSuggestions}
        disabled={loading || wardrobe.length < 2}
        className="w-full py-3 px-4 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Styling your outfits...
          </span>
        ) : (
          "Suggest Outfits"
        )}
      </button>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="space-y-3">
          {suggestions.map((outfit, index) => (
            <div
              key={index}
              onClick={() => handleOutfitClick(index, outfit.itemIds)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                activeOutfit === index
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-200 hover:border-indigo-300 bg-white"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-gray-800">
                    {outfit.description}
                  </h4>
                  <p className="text-xs text-indigo-600 mt-0.5">
                    {outfit.occasion}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    activeOutfit === index
                      ? "bg-indigo-200 text-indigo-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {outfit.itemIds.length} pieces
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {outfit.itemIds.map((id) => (
                  <span
                    key={id}
                    className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full"
                  >
                    {getItemName(id)}
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-2">{outfit.reasoning}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
