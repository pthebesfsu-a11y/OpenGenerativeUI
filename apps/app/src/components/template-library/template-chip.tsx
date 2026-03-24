"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useAgent } from "@copilotkit/react-core/v2";

/**
 * Renders a dismissible chip inside the CopilotChat input pill when a template
 * is attached (pending_template is set in agent state). Uses a portal to insert
 * itself inside the textarea's column container.
 */
export function TemplateChip() {
  const { agent } = useAgent();
  const pending = agent.state?.pending_template as
    | { id: string; name: string }
    | null
    | undefined;

  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!pending?.name) {
      // Clean up existing container
      document.querySelector("[data-template-chip]")?.remove();
      setContainer(null);
      return;
    }

    const textarea = document.querySelector<HTMLElement>(
      '[data-testid="copilot-chat-textarea"]'
    );
    // The textarea sits inside a column div inside the grid
    const textareaColumn = textarea?.parentElement;
    if (!textareaColumn) {
      setContainer(null);
      return;
    }

    // Reuse existing or create chip container
    let el = textareaColumn.querySelector<HTMLElement>("[data-template-chip]");
    if (!el) {
      el = document.createElement("div");
      el.setAttribute("data-template-chip", "");
      el.style.cssText = "display: flex; padding: 4px 0 0 0;";
      textareaColumn.insertBefore(el, textarea);
    }
    setContainer(el);
  }, [pending?.name]);

  const handleDismiss = useCallback(() => {
    agent.setState({ ...agent.state, pending_template: null });
  }, [agent]);

  if (!pending?.name || !container) return null;

  return createPortal(
    <div
      className="inline-flex items-center gap-1.5 pl-2 pr-1 py-0.5 rounded-md text-xs font-medium select-none"
      style={{
        background:
          "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(16,185,129,0.12))",
        border: "1px solid rgba(99,102,241,0.22)",
        color: "var(--copilot-kit-contrast-color, #1a1a1a)",
        animation: "chipIn 0.15s ease-out",
      }}
    >
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ opacity: 0.55, flexShrink: 0 }}
      >
        <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
      </svg>
      <span className="max-w-[140px] truncate" style={{ lineHeight: "16px" }}>
        {pending.name}
      </span>
      <button
        onClick={handleDismiss}
        className="p-0.5 rounded transition-colors duration-100 hover:bg-black/10 dark:hover:bg-white/10"
        style={{ lineHeight: 0 }}
        aria-label="Remove template"
        type="button"
      >
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>
    </div>,
    container
  );
}
