"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isToolUIPart, getToolName } from "ai";
import { Sparkles, X, Send, Loader, Compass } from "lucide-react";
import type { ExplorerUIMessage } from "@/lib/agents/explorer-agent";
import { AiActions, AI_ACTIONS, type AiAction } from "./ai-actions";
import { WalkChip } from "./walk-chip";
import { MessageBubble } from "./message-bubble";

interface AiPanelProps {
  selectedIds: string[];
  pageContextId: string | null;
  onClose: () => void;
  onNavigateToPage: (title: string) => void;
}

export function AiPanel({
  selectedIds,
  pageContextId,
  onClose,
  onNavigateToPage,
}: AiPanelProps) {
  const [input, setInput] = useState("");
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, setMessages } =
    useChat<ExplorerUIMessage>({
      transport: new DefaultChatTransport({ api: "/api/chat" }),
    });

  // Reset when context changes
  const contextKey = pageContextId || selectedIds.join(",");
  useEffect(() => {
    setMessages([]);
    setActiveAction(null);
  }, [contextKey, setMessages]);

  // Auto-scroll on new content
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const noContent = !pageContextId && selectedIds.length === 0;
  const isLoading = status !== "ready";

  function buildContextMessage(taskPrompt: string): string {
    if (pageContextId) {
      return `I'm looking at block ID "${pageContextId}" in the floatty knowledge graph.\n\nFirst, use the get_block tool with this block ID to fetch its content and subtree. Then:\n\n${taskPrompt}`;
    }
    if (selectedIds.length > 0) {
      return `I've selected ${selectedIds.length} blocks in the floatty knowledge graph.\n\nFirst, use the get_block tool to fetch each of these block IDs: ${selectedIds.join(", ")}\n\nThen:\n\n${taskPrompt}`;
    }
    return taskPrompt;
  }

  function handleAction(action: AiAction) {
    setActiveAction(action.id);
    setMessages([]);
    const msg = buildContextMessage(action.prompt);
    sendMessage({ text: msg });
  }

  function handleCustomSubmit() {
    if (!input.trim() || noContent) return;
    setActiveAction("custom");
    const msg = buildContextMessage(input);
    sendMessage({ text: msg });
    setInput("");
  }

  function handleWalkTo(pageTitle: string) {
    // Continue the conversation — don't reset context
    sendMessage({
      text: `Now walk to the page "${pageTitle}". Use expand_page to fetch its subtree, then continue your analysis from where you left off. What connections do you see between this page and what we were just looking at?`,
    });
  }

  // Extract walk suggestions from the latest suggest_walks tool call
  const walkSuggestions = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.role !== "assistant") continue;
      for (const part of msg.parts) {
        if (
          isToolUIPart(part) &&
          getToolName(part) === "suggest_walks" &&
          part.state === "output-available" &&
          part.output &&
          typeof part.output === "object" &&
          "suggested" in part.output
        ) {
          return (part.output as { suggested: string[] }).suggested;
        }
      }
    }
    return [];
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border shrink-0">
        <Sparkles size={14} className="text-magenta" />
        <span className="text-magenta text-[13px] font-bold">AI</span>
        <span className="text-dim text-[10px] ml-auto">
          {noContent ? "select content" : pageContextId ? "page context" : `${selectedIds.length} selected`}
        </span>
        <button
          onClick={onClose}
          className="bg-transparent border-none text-muted cursor-pointer hover:text-text transition-colors"
        >
          <X size={13} />
        </button>
      </div>

      {/* Actions */}
      <AiActions
        activeAction={activeAction}
        disabled={noContent || isLoading}
        onAction={handleAction}
      />

      {/* Custom question */}
      <div className="flex gap-1 p-1.5 border-b border-border shrink-0">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={noContent || isLoading}
          placeholder={noContent ? "select content\u2026" : "ask anything\u2026"}
          onKeyDown={(e) => {
            if (e.key === "Enter" && input.trim() && !noContent) {
              handleCustomSubmit();
            }
          }}
          className="flex-1 px-2 py-1 bg-bg border border-border text-text text-[11px] rounded outline-none focus:border-magenta transition-colors"
        />
        <button
          disabled={!input.trim() || noContent || isLoading}
          onClick={handleCustomSubmit}
          className="bg-magenta/15 border border-magenta/25 text-magenta px-2 py-0.5 rounded cursor-pointer disabled:opacity-40 transition-colors"
        >
          <Send size={11} />
        </button>
      </div>

      {/* Response area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-2.5">
        {messages
          .filter((m) => m.role === "assistant")
          .map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-magenta text-[12px] p-2">
            <Loader size={14} className="animate-spin-slow" />
            thinking&hellip;
          </div>
        )}

        {/* Walk suggestions */}
        {walkSuggestions.length > 0 && !isLoading && (
          <div className="mt-3 pt-2 border-t border-border">
            <div className="text-dim text-[10px] uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Compass size={10} /> walk next
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {walkSuggestions.map((w) => (
                <WalkChip
                  key={w}
                  title={w}
                  onClick={() => handleWalkTo(w)}
                />
              ))}
            </div>
          </div>
        )}

        {messages.length === 0 && !isLoading && (
          <div className="text-dim text-[11px] text-center mt-10">
            {noContent
              ? "browse + select, or click \u2728 on a page"
              : "pick an action or ask a question"}
          </div>
        )}
      </div>
    </div>
  );
}
