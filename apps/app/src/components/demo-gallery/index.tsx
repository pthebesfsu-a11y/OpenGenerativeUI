"use client";

import { useState } from "react";
import { DEMO_EXAMPLES, type DemoCategory, type DemoItem } from "./demo-data";
import { DemoCard } from "./demo-card";
import { CategoryFilter } from "./category-filter";

interface DemoGalleryProps {
  onTryDemo: (demo: DemoItem) => void;
}

export function DemoGallery({ onTryDemo }: DemoGalleryProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<DemoCategory | null>(null);

  const filtered = selectedCategory
    ? DEMO_EXAMPLES.filter((d) => d.category === selectedCategory)
    : DEMO_EXAMPLES;

  return (
    <div className="flex flex-col gap-4 h-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-3 px-6 pt-6 shrink-0">
        <div>
          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--text-primary, #1a1a1a)" }}
          >
            Demo Gallery
          </h2>
          <p
            className="text-xs mt-0.5"
            style={{ color: "var(--text-secondary, #666)" }}
          >
            Click any demo to try it with the AI agent
          </p>
        </div>
        <CategoryFilter
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          }}
        >
          {filtered.map((demo) => (
            <DemoCard key={demo.id} demo={demo} onTry={onTryDemo} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <p
              className="text-sm font-medium"
              style={{ color: "var(--text-secondary, #666)" }}
            >
              No demos in this category
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
