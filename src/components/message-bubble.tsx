"use client";

import { useJsonRenderMessage } from "@json-render/react";
import { isToolUIPart, getToolName } from "ai";
import { ExplorerRenderer } from "@/lib/catalog/explorer-renderer";
import { StepCard } from "./step-card";

interface MessageBubbleProps {
  message: { id: string; role: string; parts: unknown[] };
}

export function MessageBubble({ message }: MessageBubbleProps) {
  // Extract spec and text from message parts
  const { spec, text, hasSpec } = useJsonRenderMessage(
    message.parts as Parameters<typeof useJsonRenderMessage>[0]
  );

  return (
    <div className="mb-4">
      {/* Tool call parts (step cards) */}
      {message.parts.map((part: any, i: number) => {
        if (isToolUIPart(part)) {
          const toolName = getToolName(part);
          if (toolName === "suggest_walks") return null;
          return (
            <StepCard
              key={part.toolCallId ?? i}
              toolName={toolName}
              state={part.state}
              input={
                part.state === "input-available" ||
                part.state === "output-available"
                  ? (part.input as Record<string, unknown>)
                  : undefined
              }
              output={
                part.state === "output-available" ? part.output : undefined
              }
            />
          );
        }
        return null;
      })}

      {/* Text content (after spec extraction — only the non-spec text remains) */}
      {text && (
        <div className="text-text text-[12px] leading-relaxed whitespace-pre-wrap break-words">
          {text}
        </div>
      )}

      {/* Rendered spec (if the AI emitted one) */}
      {hasSpec && spec && (
        <div className="mt-2">
          <ExplorerRenderer spec={spec} />
        </div>
      )}
    </div>
  );
}
