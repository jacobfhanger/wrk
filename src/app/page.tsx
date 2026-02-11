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
    getWardrobe().then(setWardrobe);
  }, []);

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }, []);

  async function handleImageUpload(originalBase64: string, compressedBase64: string, mediaType: string): Promise<boolean> {
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData: originalBase64, mediaType }),
      });

      if (!res.ok) throw new Error("Analysis failed");

      const analysis: AnalysisResult = await res.json();

      const newItem: ClothingItem = {
        id: uuidv4(),
        ...analysis,
        imageData: compressedBase64,
        addedAt: new Date().toISOString(),
      };

      const stored = await addItem(newItem);
      if (!stored) {
        showToast("your closet is full! remove some items to make room");
        return false;
      }
      setWardrobe(await getWardrobe());
      showToast(`added "${analysis.name}" to your closet!`);
      return true;
    } catch {
      showToast("oops, couldn't analyze that one. try again?");
      return false;
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function handleRemove(id: string) {
    const item = wardrobe.find((i) => i.id === id);
    await removeItem(id);
    setWardrobe(await getWardrobe());
    if (item) showToast(`removed "${item.name}" from your closet`);
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass-strong sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight" style={{ color: '#6b4c6e' }}>
                my wardrobe
              </h1>
              <p className="text-sm" style={{ color: '#b8879b' }}>
                your ai bestie for outfit inspo
              </p>
            </div>
            <div className="text-right">
              <span
                className="text-2xl font-semibold"
                style={{
                  background: 'linear-gradient(135deg, #f0a6ca, #c3aed6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {wardrobe.length}
              </span>
              <p className="text-xs" style={{ color: '#b8879b' }}>pieces</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 py-6 space-y-5">
        {/* Upload Section */}
        <section className="glass rounded-3xl p-6 card-hover">
          <h2 className="text-base font-medium mb-4" style={{ color: '#6b4c6e' }}>
            add something cute
          </h2>
          <ImageUpload
            onUpload={handleImageUpload}
            isAnalyzing={isAnalyzing}
          />
        </section>

        {/* Tab Navigation */}
        <div className="flex gap-1.5 p-1.5 rounded-2xl" style={{ background: 'rgba(195, 174, 214, 0.2)' }}>
          <button
            onClick={() => {
              setActiveTab("wardrobe");
              setHighlightIds([]);
            }}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
              activeTab === "wardrobe"
                ? "glass-strong shadow-sm"
                : "hover:bg-white/30"
            }`}
            style={{ color: activeTab === "wardrobe" ? '#6b4c6e' : '#9b7ba3' }}
          >
            my closet
          </button>
          <button
            onClick={() => setActiveTab("suggest")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
              activeTab === "suggest"
                ? "glass-strong shadow-sm"
                : "hover:bg-white/30"
            }`}
            style={{ color: activeTab === "suggest" ? '#6b4c6e' : '#9b7ba3' }}
          >
            outfit inspo
          </button>
        </div>

        {/* Content */}
        <section className="glass rounded-3xl p-6">
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
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-2xl shadow-lg text-sm animate-fade-in z-50"
          style={{
            background: 'linear-gradient(135deg, #6b4c6e, #9b7ba3)',
            color: 'white',
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
