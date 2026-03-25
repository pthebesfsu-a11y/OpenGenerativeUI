"use client";

import "@copilotkit/react-core/v2/styles.css";
import "./style.css";

import MarkdownIt from "markdown-it";
import React, { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { diffWords } from "diff";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  useAgent,
  UseAgentUpdate,
  useHumanInTheLoop,
  useConfigureSuggestions,
  CopilotChat,
} from "@copilotkit/react-core/v2";
import { CopilotKit } from "@copilotkit/react-core";
import { z } from "zod";

const extensions = [StarterKit];

export default function CanvasPage() {
  // Defer CopilotChat to client-only to avoid Radix hydration ID mismatch
  const subscribe = useCallback((cb: () => void) => { cb(); return () => {}; }, []);
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  return (
    <>
      {/* Animated background */}
      <div className="abstract-bg">
        <div className="blob-3" />
      </div>

      {/* App shell */}
      <div className="brand-shell" style={{ position: "relative", zIndex: 1 }}>
        <div className="brand-glass-container">
          {/* Header Banner */}
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
                  Document to Diagram
                  <span className="font-normal" style={{ color: "var(--text-secondary)" }}> — powered by CopilotKit</span>
                </p>
              </div>
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

          <CopilotKit
            runtimeUrl="/api/copilotkit"
            showDevConsole={false}
          >
            {/* Content Area */}
            <div className="flex-1 min-h-0 flex flex-col">
              <div className="flex-1 min-h-0 flex gap-4 p-4" style={{ background: "var(--surface-light)" }}>
                {/* Left: Document Editor */}
                <div className="flex-1 overflow-hidden rounded-lg" style={{ background: "var(--surface-primary)", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)" }}>
                  <DocumentEditor />
                </div>

                {/* Right: Chat Panel */}
                <div className="w-[400px] overflow-hidden rounded-lg" style={{ background: "var(--surface-primary)", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)" }}>
                  {mounted && <CopilotChat agentId="default" className="h-full flex flex-col" />}
                </div>
              </div>
            </div>
          </CopilotKit>
        </div>
      </div>
    </>
  );
}

interface AgentState {
  document: string;
}

const DEFAULT_DOCUMENT = `# How do WebSockets Work?

## 1. The Handshake (HTTP Upgrade)

It starts as a regular HTTP request. The client sends a special header asking to "upgrade" the connection:

- GET /chat HTTP/1.1
- Upgrade: websocket
- Connection: Upgrade

The server responds with 101 Switching Protocols, and from that point on, the connection is no longer HTTP — it's a WebSocket.

## 2. The Persistent Connection

Unlike HTTP (where each request opens and closes a connection), the WebSocket connection stays open. Both sides can now send messages to each other at any time without waiting for the other to ask first.

## 3. Frames, Not Requests

Data is sent as lightweight "frames" — small packets that can carry text, binary data, or control signals (like ping/pong to keep the connection alive).

## HTTP vs WebSocket

| Aspect | HTTP | WebSocket |
|--------|------|-----------|
| Direction | One-way (request → response) | Two-way (either side) |
| Connection | Opens and closes each time | Stays open |
| Overhead | Headers sent every request | Minimal after handshake |
| Use case | Loading pages, REST APIs | Chat, live feeds, games |

## A simple mental model

Think of HTTP like sending letters — you write one, wait for a reply, then write another. WebSocket is like a phone call — once connected, both people can speak freely at any time without hanging up between each sentence.

## Common use cases

- Chat apps — messages appear instantly without polling
- Live dashboards — stock prices, sports scores, analytics
- Multiplayer games — real-time position and state sync
- Collaborative tools — like Google Docs, where edits appear live`;

const DocumentEditor = () => {
  const editor = useEditor({
    extensions,
    immediatelyRender: false,
    editorProps: {
      attributes: { class: "tiptap" },
    },
  });

  const [placeholderVisible, setPlaceholderVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const currentDocumentRef = useRef(DEFAULT_DOCUMENT);
  const lastPlainTextRef = useRef("");
  const wasRunning = useRef(false);
  const isMountedRef = useRef(true);

  // Initialize editor with default document on mount (convert markdown → HTML)
  const initializedRef = useRef(false);
  useEffect(() => {
    if (!editor || !isMountedRef.current || initializedRef.current) return;
    initializedRef.current = true;
    editor.commands.setContent(fromMarkdown(currentDocumentRef.current));
    lastPlainTextRef.current = editor.getText() || "";
  }, [editor]);

  // Cleanup on unmount to prevent state updates after component is removed
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Track editor focus state
  useEffect(() => {
    if (!editor) return;

    const handleFocus = () => {
      if (isMountedRef.current) setIsFocused(true);
    };
    const handleBlur = () => {
      if (isMountedRef.current) setIsFocused(false);
    };

    editor.on("focus", handleFocus);
    editor.on("blur", handleBlur);

    return () => {
      editor.off("focus", handleFocus);
      editor.off("blur", handleBlur);
    };
  }, [editor]);

  useConfigureSuggestions({
    suggestions: [
      {
        title: "Generate WebSocket document",
        message: "Create a comprehensive document explaining how WebSockets work, including the handshake process, persistent connections, frames, comparison with HTTP, and common use cases.",
      },
      {
        title: "Explain REST API architecture",
        message: "Write a detailed document about REST API design principles, HTTP methods, status codes, request/response structure, and best practices.",
      },
      {
        title: "Microservices architecture",
        message: "Write a comprehensive guide to microservices architecture, covering service decomposition, inter-service communication, data consistency, and deployment patterns.",
      },
    ],
  });

  const { agent } = useAgent({
    agentId: "default",
    updates: [UseAgentUpdate.OnStateChanged, UseAgentUpdate.OnRunStatusChanged],
  });

  const agentState = agent.state as AgentState | undefined;
  const setAgentState = useCallback((s: AgentState) => agent.setState(s), [agent]);
  const isLoading = agent.isRunning;

  // Handle loading state transitions
  useEffect(() => {
    if (!isMountedRef.current) return;

    if (isLoading) {
      currentDocumentRef.current = agentState?.document || editor?.getText() || "";
    }
    editor?.setEditable(!isLoading);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally only reacting to isLoading changes
  }, [isLoading, editor]);

  // Handle final state update when run completes
  useEffect(() => {
    if (!isMountedRef.current) return;

    if (wasRunning.current && !isLoading) {
      const saved = currentDocumentRef.current;
      const newDoc = agentState?.document || "";
      if (saved.trim().length > 0 && saved !== newDoc) {
        const diff = diffPartialText(saved, newDoc, true);
        editor?.commands.setContent(fromMarkdown(diff));
      }
      currentDocumentRef.current = newDoc;
      lastPlainTextRef.current = editor?.getText() || "";
    }
    wasRunning.current = isLoading;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only trigger on run status transitions
  }, [isLoading]);

  // Handle streaming updates while agent is running
  useEffect(() => {
    if (!isMountedRef.current) return;

    if (isLoading && agentState?.document) {
      const saved = currentDocumentRef.current;
      if (saved.trim().length > 0) {
        const diff = diffPartialText(saved, agentState.document);
        editor?.commands.setContent(fromMarkdown(diff));
      } else {
        editor?.commands.setContent(fromMarkdown(agentState.document));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only trigger on document content changes
  }, [agentState?.document]);

  const text = editor?.getText() || "";

  // Sync user edits to agent state
  useEffect(() => {
    if (!isMountedRef.current) return;

    setPlaceholderVisible(text.length === 0 && !isFocused);

    if (!isLoading && text !== lastPlainTextRef.current) {
      lastPlainTextRef.current = text;
      currentDocumentRef.current = text;
      setAgentState({ document: text });
    }
  }, [text, isLoading, isFocused, setAgentState]);

  // Human-in-the-loop: confirm_changes
  useHumanInTheLoop(
    {
      agentId: "default",
      name: "confirm_changes",
      description: "Present the proposed changes to the user for review",
      parameters: z.object({
        document: z.string().describe("The full updated document in markdown format"),
      }),
      render({ status, respond }: { args: { document?: string }; status: string; respond?: (result: unknown) => Promise<void> }) {
        if (status === "executing") {
          return (
            <ConfirmChanges
              respond={respond}
              status={status}
              onReject={() => {
                const savedDoc = currentDocumentRef.current;
                editor?.commands.setContent(fromMarkdown(savedDoc));
                setAgentState({ document: savedDoc });
              }}
              onConfirm={() => {
                const newDoc = agentState?.document || "";
                editor?.commands.setContent(fromMarkdown(newDoc));
                currentDocumentRef.current = newDoc;
                lastPlainTextRef.current = editor?.getText() || "";
                setAgentState({ document: newDoc });
              }}
            />
          );
        }
        return <></>;
      },
    },
    [agentState?.document],
  );

  return (
    <div className="relative h-full w-full flex flex-col overflow-hidden">
      {placeholderVisible && (
        <div className="absolute top-6 left-10 pointer-events-none text-sm" style={{ color: "var(--text-tertiary)" }}>
          How do WebSockets work?
        </div>
      )}
      <div
        className={`flex-1 overflow-hidden flex flex-col ${isLoading ? "editor-streaming" : ""}`}
        style={{ cursor: "text" }}
      >
        <EditorContent
          editor={editor}
          className="h-full p-10 overflow-y-auto"
          style={{ cursor: "text" }}
        />
      </div>
    </div>
  );
};

interface ConfirmChangesProps {
  respond: ((result: unknown) => Promise<void>) | undefined;
  status: string;
  onReject: () => void;
  onConfirm: () => void;
}

function ConfirmChanges({ respond, status, onReject, onConfirm }: ConfirmChangesProps) {
  const [accepted, setAccepted] = useState<boolean | null>(null);

  return (
    <div className="p-4 rounded-lg m-4" style={{ background: "var(--surface-quaternary)" }}>
      <h2 className="text-base font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Confirm Changes</h2>
      <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>Accept the proposed changes?</p>
      {accepted === null && (
        <div className="flex justify-end gap-3">
          <button
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              status === "executing"
                ? "cursor-pointer"
                : "cursor-default"
            }`}
            style={{
              background: status === "executing" ? "var(--surface-quaternary)" : "var(--surface-tertiary)",
              color: status === "executing" ? "var(--text-primary)" : "var(--text-tertiary)",
            }}
            disabled={status !== "executing"}
            onClick={() => {
              if (respond) {
                setAccepted(false);
                onReject();
                respond({ accepted: false });
              }
            }}
          >
            Reject
          </button>
          <button
            className={`px-4 py-2 rounded text-sm font-medium text-white transition-colors ${
              status === "executing"
                ? "cursor-pointer"
                : "cursor-default"
            }`}
            style={{
              background: status === "executing" ? "var(--color-lilac-dark)" : "var(--text-tertiary)",
            }}
            disabled={status !== "executing"}
            onClick={() => {
              if (respond) {
                setAccepted(true);
                onConfirm();
                respond({ accepted: true });
              }
            }}
          >
            Confirm
          </button>
        </div>
      )}
      {accepted !== null && (
        <div className="flex justify-end">
          <div className="text-sm font-medium px-3 py-1 rounded" style={{ background: "var(--surface-quaternary)", color: "var(--text-secondary)" }}>
            {accepted ? "✓ Accepted" : "✗ Rejected"}
          </div>
        </div>
      )}
    </div>
  );
}

function fromMarkdown(text: string) {
  const md = new MarkdownIt({
    typographer: true,
    html: true,
  });

  return md.render(text);
}

function diffPartialText(oldText: string, newText: string, isComplete: boolean = false) {
  let oldTextToCompare = oldText;
  if (oldText.length > newText.length && !isComplete) {
    oldTextToCompare = oldText.slice(0, newText.length);
  }

  const changes = diffWords(oldTextToCompare, newText);

  let result = "";
  changes.forEach((part) => {
    if (part.added) {
      result += `<em>${part.value}</em>`;
    } else if (part.removed) {
      result += `<s>${part.value}</s>`;
    } else {
      result += part.value;
    }
  });

  if (oldText.length > newText.length && !isComplete) {
    result += oldText.slice(newText.length);
  }

  return result;
}
