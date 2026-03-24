"use client";

import { useState, useCallback } from "react";
import { useAgent } from "@copilotkit/react-core/v2";
import { TemplateCard } from "./template-card";

/** Submit a message through the CopilotChat textarea so it goes through the full rendering pipeline */
function submitChatPrompt(text: string) {
  const textarea = document.querySelector<HTMLTextAreaElement>(
    '[data-testid="copilot-chat-textarea"]'
  );
  if (!textarea) {
    console.warn("submitChatPrompt: CopilotChat textarea not found — template apply message was not sent.");
    return;
  }

  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype, "value"
  )?.set;
  setter?.call(textarea, text);
  textarea.dispatchEvent(new Event("input", { bubbles: true }));

  setTimeout(() => {
    const form = textarea.closest("form");
    if (form) form.requestSubmit();
  }, 150);
}

interface TemplateLibraryProps {
  open: boolean;
  onClose: () => void;
}

interface Template {
  id: string;
  name: string;
  description: string;
  html: string;
  data_description: string;
  component_type?: string;
  component_data?: Record<string, unknown>;
  version: number;
}

export function TemplateLibrary({ open, onClose }: TemplateLibraryProps) {
  const { agent } = useAgent();
  const templates: Template[] = agent.state?.templates || [];

  // Apply flow: show input for new data before sending
  const [applyingTemplate, setApplyingTemplate] = useState<Template | null>(null);
  const [applyData, setApplyData] = useState("");

  const handleApplyClick = (id: string) => {
    const template = templates.find((t) => t.id === id);
    if (template) {
      setApplyingTemplate(template);
      setApplyData("");
    }
  };

  const handleApplyConfirm = useCallback(() => {
    if (!applyingTemplate) return;
    const dataDesc = applyData.trim();
    if (!dataDesc) return;

    // Set pending_template in agent state so the agent knows which template to apply.
    // Spread full state to guard against replace-style setState.
    agent.setState({
      ...agent.state,
      pending_template: { id: applyingTemplate.id, name: applyingTemplate.name },
    });

    // Send only the user's data description — no template ID in the message
    submitChatPrompt(dataDesc);

    setApplyingTemplate(null);
    setApplyData("");
    onClose();
  }, [agent, applyingTemplate, applyData, onClose]);

  const handleApplyCancel = () => {
    setApplyingTemplate(null);
    setApplyData("");
  };

  const handleDelete = (id: string) => {
    agent.setState({
      ...agent.state,
      templates: templates.filter((t) => t.id !== id),
    });
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(2px)" }}
          onClick={onClose}
        />
      )}

      {/* Drawer panel */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col transition-transform duration-300 ease-in-out"
        style={{
          width: 380,
          maxWidth: "90vw",
          transform: open ? "translateX(0)" : "translateX(100%)",
          background: "var(--surface-primary, #fff)",
          borderLeft: "1px solid var(--color-border-glass, rgba(0,0,0,0.1))",
          boxShadow: open ? "-8px 0 30px rgba(0,0,0,0.1)" : "none",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{
            borderBottom: "1px solid var(--color-border-glass, rgba(0,0,0,0.1))",
          }}
        >
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-secondary, #666)" }}>
              <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
            </svg>
            <h2
              className="text-base font-semibold"
              style={{ color: "var(--text-primary, #1a1a1a)" }}
            >
              Templates
            </h2>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{
                background: "var(--color-background-secondary, #f5f5f5)",
                color: "var(--text-secondary, #666)",
              }}
            >
              {templates.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors duration-150"
            style={{ color: "var(--text-secondary, #666)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-tertiary, #999)", opacity: 0.5 }}>
                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
              </svg>
              <p
                className="text-sm font-medium"
                style={{ color: "var(--text-secondary, #666)" }}
              >
                No templates yet
              </p>
              <p
                className="text-xs"
                style={{ color: "var(--text-tertiary, #999)" }}
              >
                Hover over a widget and click &quot;Save as Template&quot; to save it for reuse.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {templates.map((t) => (
                <TemplateCard
                  key={t.id}
                  id={t.id}
                  name={t.name}
                  description={t.description}
                  html={t.html}
                  componentType={t.component_type}
                  componentData={t.component_data}
                  dataDescription={t.data_description}
                  version={t.version}
                  onApply={handleApplyClick}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>

        {/* Apply data input — slides up from bottom of drawer */}
        {applyingTemplate && (
          <div
            className="shrink-0 px-4 pb-4 pt-3"
            style={{
              borderTop: "1px solid var(--color-border-glass, rgba(0,0,0,0.1))",
              animation: "tmpl-slideIn 0.2s ease-out",
            }}
          >
            <p
              className="text-xs font-semibold mb-1"
              style={{ color: "var(--text-primary, #1a1a1a)" }}
            >
              Apply &quot;{applyingTemplate.name}&quot;
            </p>
            <p
              className="text-[11px] mb-2"
              style={{ color: "var(--text-tertiary, #999)" }}
            >
              Describe the new data you want to populate this template with:
            </p>
            <textarea
              value={applyData}
              onChange={(e) => setApplyData(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleApplyConfirm();
                }
                if (e.key === "Escape") handleApplyCancel();
              }}
              autoFocus
              placeholder='e.g. "$2,400 web design project for Sarah Chen, due April 15"'
              rows={2}
              className="w-full text-xs px-3 py-2 rounded-lg outline-none resize-none"
              style={{
                background: "var(--color-background-secondary, #f5f5f5)",
                color: "var(--text-primary, #1a1a1a)",
                border: "1px solid var(--color-border-tertiary, rgba(0,0,0,0.1))",
              }}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleApplyConfirm}
                disabled={!applyData.trim()}
                className="flex-1 text-xs font-medium py-1.5 rounded-lg text-white transition-all duration-150 disabled:opacity-40"
                style={{
                  background: "linear-gradient(135deg, var(--color-lilac-dark, #6366f1), var(--color-mint-dark, #10b981))",
                }}
              >
                Apply Template
              </button>
              <button
                onClick={handleApplyCancel}
                className="text-xs px-3 py-1.5 rounded-lg"
                style={{
                  border: "1px solid var(--color-border-tertiary, rgba(0,0,0,0.1))",
                  color: "var(--text-secondary, #666)",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
