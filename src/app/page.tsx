"use client";

import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { ClothingItem, AnalysisResult } from "@/lib/types";
import { getWardrobe, addItem, removeItem } from "@/lib/wardrobe-store";
import ImageUpload from "@/components/ImageUpload";
import WardrobeGrid from "@/components/WardrobeGrid";
import OutfitSuggestions from "@/components/OutfitSuggestions";

type Tab = "wardrobe" | "suggest";

export default function Home() {
  const [wardrobe, setWardrobe] = useState<ClothingItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("wardrobe");
  const [highlightIds, setHighlightIds] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setWardrobe(getWardrobe());
  }, []);

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }, []);

  async function handleImageUpload(imageData: string, mediaType: string) {
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData, mediaType }),
      });

      if (!res.ok) throw new Error("Analysis failed");

      const analysis: AnalysisResult = await res.json();

      const newItem: ClothingItem = {
        id: uuidv4(),
        ...analysis,
        imageData,
        addedAt: new Date().toISOString(),
      };

      addItem(newItem);
      setWardrobe(getWardrobe());
      showToast(`Added "${analysis.name}" to your wardrobe!`);
    } catch {
      showToast("Failed to analyze the clothing item. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  function handleRemove(id: string) {
    const item = wardrobe.find((i) => i.id === id);
    removeItem(id);
    setWardrobe(getWardrobe());
    if (item) showToast(`Removed "${item.name}" from your wardrobe.`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Wardrobe Consultant
              </h1>
              <p className="text-sm text-gray-500">
                AI-powered outfit suggestions from your closet
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-semibold text-indigo-600">
                {wardrobe.length}
              </span>
              <p className="text-xs text-gray-500">items</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Upload Section */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Add to your wardrobe
          </h2>
          <ImageUpload
            onUpload={handleImageUpload}
            isAnalyzing={isAnalyzing}
          />
        </section>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-gray-200 p-1 rounded-xl">
          <button
            onClick={() => {
              setActiveTab("wardrobe");
              setHighlightIds([]);
            }}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === "wardrobe"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            My Wardrobe
          </button>
          <button
            onClick={() => setActiveTab("suggest")}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === "suggest"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Outfit Suggestions
          </button>
        </div>

        {/* Content */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          {activeTab === "wardrobe" && (
            <WardrobeGrid
              items={wardrobe}
              onRemove={handleRemove}
              highlightIds={
                highlightIds.length > 0 ? highlightIds : undefined
              }
            />
          )}

          {activeTab === "suggest" && (
            <OutfitSuggestions
              wardrobe={wardrobe}
              onHighlight={(ids) => {
                setHighlightIds(ids);
                if (ids.length > 0) setActiveTab("wardrobe");
              }}
            />
          )}
        </section>
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-lg text-sm animate-fade-in z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
