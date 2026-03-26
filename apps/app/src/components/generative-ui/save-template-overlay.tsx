"use client";

import { useState, useCallback, useMemo, useRef, useEffect, type ReactNode } from "react";
import { useAgent } from "@copilotkit/react-core/v2";
import { SEED_TEMPLATES } from "@/components/template-library/seed-templates";
import {
  assembleStandaloneHtml,
  chartToStandaloneHtml,
  triggerDownload,
  slugify,
} from "./export-utils";

type SaveState = "idle" | "input" | "saving" | "saved";

interface SaveTemplateOverlayProps {
  /** Title used as default template name */
  title: string;
  /** Description stored with the template */
  description: string;
  /** Raw HTML to save (for widget renderer templates) */
  html?: string;
  /** Structured data to save (for chart templates) */
  componentData?: Record<string, unknown>;
  /** The component type that produced this (e.g. "barChart", "pieChart", "widgetRenderer") */
  componentType: string;
  /** Whether content has finished rendering — button hidden until true */
  ready?: boolean;
  children: ReactNode;
}

export function SaveTemplateOverlay({
  title,
  description,
  html,
  componentData,
  componentType,
  ready = true,
  children,
}: SaveTemplateOverlayProps) {
  const { agent } = useAgent();
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [templateName, setTemplateName] = useState("");
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  // Capture pending_template at mount time — it may be cleared by the agent later.
  // Uses ref (not state) to avoid an async re-render that would shift sibling positions
  // and cause React to remount the iframe, losing rendered 3D/canvas content.
  const pending = agent.state?.pending_template as { id: string; name: string } | null | undefined;
  const sourceRef = useRef<{ id: string; name: string } | null>(null);
  // eslint-disable-next-line react-hooks/refs -- one-time ref init during render (React-endorsed pattern)
  if (pending?.id && !sourceRef.current) {
    sourceRef.current = pending; // eslint-disable-line react-hooks/refs
  }

  // Check if this content matches an existing template:
  // 1. Exact HTML match (seed templates rendered as-is)
  // 2. Source template captured from pending_template (applied templates with modified data)
  const matchedTemplate = useMemo(() => {
    // First check source template from apply flow
    if (sourceRef.current) { // eslint-disable-line react-hooks/refs
      const allTemplates = [
        ...SEED_TEMPLATES,
        ...((agent.state?.templates as { id: string; name: string }[]) || []),
      ];
      const source = allTemplates.find((t) => t.id === sourceRef.current!.id); // eslint-disable-line react-hooks/refs
      if (source) return source;
    }
    // Then check exact HTML match
    if (!html) return null;
    const normalise = (s: string) => s.replace(/\s+/g, " ").trim();
    const norm = normalise(html);
    const allTemplates = [
      ...SEED_TEMPLATES,
      ...((agent.state?.templates as { id: string; name: string; html: string }[]) || []),
    ];
    return allTemplates.find((t) => t.html && normalise(t.html) === norm) ?? null;
  }, [html, agent.state?.templates]);

  const handleSave = useCallback(() => {
    const name = templateName.trim() || title || "Untitled Template";
    setSaveState("saving");
    setMenuOpen(false);

    const templates = agent.state?.templates || [];
    const newTemplate = {
      id: crypto.randomUUID(),
      name,
      description: description || title || "",
      html: html || "",
      component_type: componentType,
      component_data: componentData || null,
      data_description: "",
      created_at: new Date().toISOString(),
      version: 1,
    };
    agent.setState({ ...agent.state, templates: [...templates, newTemplate] });

    setTemplateName("");
    setTimeout(() => {
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 1800);
    }, 400);
  }, [agent, templateName, title, description, html, componentData, componentType]);

  const exportHtml = useMemo(() => {
    if (componentType === "widgetRenderer" && html) {
      return assembleStandaloneHtml(html, title);
    }
    if ((componentType === "barChart" || componentType === "pieChart") && componentData) {
      const chartType = componentType === "barChart" ? "bar" : "pie";
      return chartToStandaloneHtml(
        chartType,
        componentData as { title: string; description: string; data: Array<{ label: string; value: number }> }
      );
    }
    return null;
  }, [componentType, html, componentData, title]);

  const handleDownload = useCallback(() => {
    if (!exportHtml) return;
    const filename = `${slugify(title) || "visualization"}.html`;
    triggerDownload(exportHtml, filename);
    setMenuOpen(false);
  }, [exportHtml, title]);

  const handleCopy = useCallback(() => {
    const textToCopy = componentType === "widgetRenderer" ? html : exportHtml;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopyState("copied");
      setMenuOpen(false);
      setTimeout(() => setCopyState("idle"), 1800);
    });
  }, [componentType, html, exportHtml]);

  // Show the trigger button only when hovered or menu/save-input is active
  const showTrigger = ready && (hovered || menuOpen || saveState === "input" || saveState === "saving" || saveState === "saved");

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Action overlay — hidden until hover */}
      <div
        className="absolute top-2 right-2 z-10 transition-opacity duration-200"
        style={{
          opacity: showTrigger ? 1 : 0,
          pointerEvents: showTrigger ? "auto" : "none",
        }}
      >
        {/* Saved confirmation */}
        {saveState === "saved" && (
          <div
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-md"
            style={{
              background: "var(--color-background-success, #EAF3DE)",
              color: "var(--color-text-success, #3B6D11)",
              border: "1px solid var(--color-border-success, #3B6D11)",
              animation: "tmpl-pop 0.35s cubic-bezier(.34,1.56,.64,1)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" style={{ strokeDasharray: 24, strokeDashoffset: 24, animation: "tmpl-check 0.4s ease-out 0.1s forwards" }} />
            </svg>
            Saved!
          </div>
        )}

        {/* Saving spinner */}
        {saveState === "saving" && (
          <div
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium shadow-md"
            style={{
              background: "var(--surface-primary, #fff)",
              border: "1px solid var(--color-border-glass, rgba(0,0,0,0.1))",
              color: "var(--text-secondary, #666)",
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                border: "2px solid var(--color-border-tertiary, rgba(0,0,0,0.15))",
                borderTopColor: "var(--color-lilac-dark, #6366f1)",
                animation: "spin 0.6s linear infinite",
              }}
            />
            Saving...
          </div>
        )}

        {/* Name input for save-as-template */}
        {saveState === "input" && (
          <div
            className="flex items-center gap-2 rounded-lg px-3 py-2 shadow-lg"
            style={{
              background: "var(--surface-primary, #fff)",
              border: "1px solid var(--color-border-glass, rgba(0,0,0,0.1))",
              animation: "tmpl-slideIn 0.2s ease-out",
            }}
          >
            <input
              type="text"
              placeholder="Template name..."
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") {
                  setSaveState("idle");
                  setTemplateName("");
                }
              }}
              autoFocus
              className="text-xs px-2 py-1 rounded-md outline-none"
              style={{
                width: 140,
                background: "var(--color-background-secondary, #f5f5f5)",
                color: "var(--text-primary, #1a1a1a)",
                border: "1px solid var(--color-border-tertiary, rgba(0,0,0,0.1))",
              }}
            />
            <button
              onClick={handleSave}
              className="text-xs px-2 py-1 rounded-md font-medium text-white"
              style={{
                background: "linear-gradient(135deg, var(--color-lilac-dark, #6366f1), var(--color-mint-dark, #10b981))",
              }}
            >
              Save
            </button>
            <button
              onClick={() => { setSaveState("idle"); setTemplateName(""); }}
              className="text-xs px-1.5 py-1 rounded-md"
              style={{ color: "var(--text-secondary, #666)" }}
            >
              Cancel
            </button>
          </div>
        )}

        {/* Idle: three-dot trigger + dropdown menu */}
        {saveState === "idle" && (
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center justify-center rounded-lg p-1.5 shadow-md transition-all duration-150 hover:scale-105"
              style={{
                background: "var(--surface-primary, #fff)",
                border: "1px solid var(--color-border-glass, rgba(0,0,0,0.1))",
                color: "var(--text-secondary, #666)",
              }}
              title="Options"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </button>

            {menuOpen && (
              <div
                className="absolute top-full right-0 mt-1 rounded-lg py-1 shadow-lg min-w-[180px]"
                style={{
                  background: "var(--surface-primary, #fff)",
                  border: "1px solid var(--color-border-glass, rgba(0,0,0,0.1))",
                  animation: "tmpl-slideIn 0.15s ease-out",
                }}
              >
                {exportHtml && (
                  <>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-left transition-colors duration-100"
                      style={{ color: copyState === "copied" ? "var(--color-text-success, #3B6D11)" : "var(--text-primary, #1a1a1a)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-background-secondary, #f5f5f5)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      {copyState === "copied" ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                      )}
                      {copyState === "copied" ? "Copied!" : "Copy to clipboard"}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-left transition-colors duration-100"
                      style={{ color: "var(--text-primary, #1a1a1a)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-background-secondary, #f5f5f5)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      Download file
                    </button>
                  </>
                )}
                {!matchedTemplate && (
                  <button
                    onClick={() => { setMenuOpen(false); setSaveState("input"); }}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-left transition-colors duration-100"
                    style={{ color: "var(--text-primary, #1a1a1a)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-background-secondary, #f5f5f5)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                    </svg>
                    Save as artifact
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Template name badge — shown above widget when matched */}
      {saveState === "idle" && matchedTemplate && ready && (
        <div className="flex justify-end mb-1">
          <div
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium"
            style={{
              background: "linear-gradient(135deg, rgba(99,102,241,0.10), rgba(16,185,129,0.10))",
              border: "1px solid rgba(99,102,241,0.20)",
              color: "var(--text-primary, #1a1a1a)",
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.55 }}>
              <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
            </svg>
            {matchedTemplate.name}
          </div>
        </div>
      )}

      {children}
    </div>
  );
}
