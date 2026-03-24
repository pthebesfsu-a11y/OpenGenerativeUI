"use client";

import { useEffect, useState } from "react";
import { ExampleLayout } from "@/components/example-layout";
import { useGenerativeUIExamples, useExampleSuggestions } from "@/hooks";
import { useSeedTemplates } from "@/hooks/use-seed-templates";
import { ExplainerCardsPortal } from "@/components/explainer-cards";
import { TemplateLibrary } from "@/components/template-library";
import { TemplateChip } from "@/components/template-library/template-chip";

import { CopilotChat } from "@copilotkit/react-core/v2";

export default function HomePage() {
  useGenerativeUIExamples();
  useExampleSuggestions();
  useSeedTemplates();

  const [templateDrawerOpen, setTemplateDrawerOpen] = useState(false);

  // Widget bridge: handle messages from widget iframes
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "open-link" && typeof e.data.url === "string") {
        window.open(e.data.url, "_blank", "noopener,noreferrer");
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);


  return (
    <>
      {/* Animated background */}
      <div className="abstract-bg">
        <div className="blob-3" />
      </div>

      {/* App shell */}
      <div className="brand-shell" style={{ position: "relative", zIndex: 1 }}>
        <div className="brand-glass-container">
          {/* CTA Banner */}
          <div
            className="shrink-0 border-b border-white/30 dark:border-white/8"
            style={{
              background: "linear-gradient(135deg, rgba(190,194,255,0.08) 0%, rgba(133,224,206,0.06) 100%)",
            }}
          >
            <div className="flex items-center justify-between gap-4 px-5 py-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  className="flex items-center justify-center shrink-0 w-9 h-9 rounded-lg text-white"
                  style={{
                    background: "linear-gradient(135deg, var(--color-lilac), var(--color-mint))",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <p className="text-base font-semibold m-0 leading-snug" style={{ color: "var(--text-primary)" }}>
                  Open Generative UI
                  <span className="font-normal" style={{ color: "var(--text-secondary)" }}> — powered by CopilotKit</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* Template Library toggle */}
                <button
                  onClick={() => setTemplateDrawerOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium no-underline whitespace-nowrap transition-all duration-150 hover:-translate-y-px"
                  style={{
                    color: "var(--text-secondary)",
                    border: "1px solid var(--color-border-glass, rgba(0,0,0,0.1))",
                    background: "var(--surface-primary, rgba(255,255,255,0.6))",
                    fontFamily: "var(--font-family)",
                  }}
                  title="Open Template Library"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                  </svg>
                  Templates
                </button>
                <a
                  href="https://github.com/CopilotKit/OpenGenerativeUI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-5 py-2 rounded-full text-sm font-semibold text-white no-underline whitespace-nowrap transition-all duration-150 hover:-translate-y-px"
                  style={{
                    background: "linear-gradient(135deg, var(--color-lilac-dark), var(--color-mint-dark))",
                    boxShadow: "0 1px 4px rgba(149,153,204,0.3)",
                    fontFamily: "var(--font-family)",
                  }}
                >
                  Get started
                </a>
              </div>
            </div>
          </div>

          <ExampleLayout chatContent={
            <CopilotChat
              labels={{
                welcomeMessageText: "What do you want to visualize today?",
              }}
            />
          } />
          <ExplainerCardsPortal />
        </div>
      </div>

      {/* Template chip — portal renders above chat input */}
      <TemplateChip />

      {/* Template Library Drawer */}
      <TemplateLibrary
        open={templateDrawerOpen}
        onClose={() => setTemplateDrawerOpen(false)}
      />
    </>
  );
}
