"use client";

import { FileText, Sparkles, Compass, Brain, Zap } from "lucide-react";
import { colors } from "@/lib/constants";

export interface AiAction {
  id: string;
  icon: typeof FileText;
  label: string;
  color: string;
  prompt: string;
}

export const AI_ACTIONS: AiAction[] = [
  {
    id: "summarize",
    icon: FileText,
    label: "Summarize",
    color: colors.cyan,
    prompt:
      "Summarize this subtree. What is it? What state? What decisions? How does it connect to the rest of the graph?",
  },
  {
    id: "patterns",
    icon: Sparkles,
    label: "Patterns",
    color: colors.magenta,
    prompt:
      "Find recurring patterns, themes, and implicit connections. Cite specific content. Look at [[wikilinks]] for graph-level patterns.",
  },
  {
    id: "bridge",
    icon: Compass,
    label: "Bridge Walk",
    color: colors.purple,
    prompt:
      "You are a bridge walker. Surface 3-5 unexpected observations. Don't summarize — find the surprising. What's adjacent but not linked? What question is raised but not answered? What would you walk toward next?",
  },
  {
    id: "coldstart",
    icon: Brain,
    label: "Cold-Start",
    color: colors.green,
    prompt:
      "Write a cold-start briefing in ctx:: format for a new Claude instance. 8-12 lines: what this is, state, decisions, key links, pending items.",
  },
  {
    id: "gaps",
    icon: Zap,
    label: "Gaps",
    color: colors.coral,
    prompt:
      "Audit for gaps: empty stubs, unanswered questions, orphan wikilinks, TODOs without follow-through, asymmetric links, ctx:: entries without corresponding content.",
  },
];

interface AiActionsProps {
  activeAction: string | null;
  disabled: boolean;
  onAction: (action: AiAction) => void;
}

export function AiActions({ activeAction, disabled, onAction }: AiActionsProps) {
  return (
    <div className="flex gap-1 flex-wrap p-2 border-b border-border/60 shrink-0">
      {AI_ACTIONS.map((a) => {
        const Icon = a.icon;
        const isActive = activeAction === a.id;
        return (
          <button
            key={a.id}
            disabled={disabled}
            onClick={() => onAction(a)}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] border cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-default"
            style={{
              background: isActive ? `${a.color}15` : "transparent",
              borderColor: isActive ? a.color : `${colors.border}80`,
              color: a.color,
            }}
          >
            <Icon size={10} />
            {a.label}
          </button>
        );
      })}
    </div>
  );
}
