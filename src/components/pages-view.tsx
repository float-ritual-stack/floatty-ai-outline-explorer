"use client";

import { Square, CheckSquare, Sparkles } from "lucide-react";
import { truncate, getProjectColor } from "@/lib/constants";
import { usePageFilter } from "@/hooks/use-pages";
import type { PageListItem } from "@/lib/types";

interface PagesViewProps {
  pages: PageListItem[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onNavigate: (id: string) => void;
  onAnalyze: (id: string) => void;
  onNavigateToPage: (title: string) => void;
}

export function PagesView({
  pages,
  selectedIds,
  onToggleSelect,
  onNavigate,
  onAnalyze,
  onNavigateToPage,
}: PagesViewProps) {
  return (
    <div>
      {pages.map((pg, i) => {
        const isSel = pg.blockId ? selectedIds.has(pg.blockId) : false;
        return (
          <div
            key={`${pg.name}-${i}`}
            className="flex items-center gap-1.5 px-1.5 py-1 border-b border-border/5 text-[11px] hover:bg-hover transition-colors"
          >
            {pg.blockId && (
              <span
                onClick={() => onToggleSelect(pg.blockId!)}
                className={`cursor-pointer ${
                  isSel ? "text-magenta" : "text-dim"
                }`}
              >
                {isSel ? <CheckSquare size={10} /> : <Square size={10} />}
              </span>
            )}
            <span
              onClick={() => onNavigateToPage(pg.name)}
              className="text-text flex-1 cursor-pointer"
            >
              {truncate(pg.name, 50)}
            </span>
            <span
              onClick={() => {
                if (pg.blockId) onAnalyze(pg.blockId);
              }}
              className="text-magenta cursor-pointer opacity-50 hover:opacity-100 shrink-0 transition-opacity"
            >
              <Sparkles size={10} />
            </span>
            <span className="text-dim text-[9px] w-7 text-right">
              {pg.blockCount}
            </span>
          </div>
        );
      })}
    </div>
  );
}
