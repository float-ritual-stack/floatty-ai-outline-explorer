"use client";

import { useState, useCallback, useRef } from "react";
import type { ViewMode } from "@/lib/types";
import { usePages, usePageFilter } from "@/hooks/use-pages";
import { Header } from "./header";
import { SidebarTabs } from "./sidebar-tabs";
import { PagesView } from "./pages-view";
import { SearchView } from "./search-view";
import { TimelineView } from "./timeline-view";
import { BlockFocus } from "./block-focus";
import { AiPanel } from "./ai-panel";
import { ViewErrorBoundary } from "./view-error-boundary";

export function Explorer() {
  const { pages, loading: pagesLoading, blockCount, ctxCount } = usePages();

  const [view, setView] = useState<ViewMode>("pages");
  const [focusBlockId, setFocusBlockId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pageContextId, setPageContextId] = useState<string | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [pageFilter, setPageFilter] = useState("");
  const [aiWidth, setAiWidth] = useState(380);
  const dragging = useRef(false);

  const filteredPages = usePageFilter(pages, pageFilter);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setPageContextId(null);
    setAiOpen(true);
  }, []);

  const navigateTo = useCallback((id: string) => {
    setFocusBlockId(id);
  }, []);

  const analyzeAi = useCallback((id: string) => {
    setPageContextId(id);
    setSelectedIds(new Set());
    setAiOpen(true);
  }, []);

  const navigateToPageByTitle = useCallback(
    async (title: string) => {
      try {
        const res = await fetch(
          `/api/pages?prefix=${encodeURIComponent(title)}&limit=3`
        );
        if (!res.ok) return;
        const data = await res.json();
        const pages = (data.pages ?? []) as { name: string; blockId: string | null }[];
        const lTitle = title.toLowerCase();

        const exact = pages.find((p) => p.name.toLowerCase() === lTitle);
        if (exact?.blockId) { setFocusBlockId(exact.blockId); analyzeAi(exact.blockId); return; }

        const prefix = pages.find((p) => p.name.toLowerCase().startsWith(lTitle));
        if (prefix?.blockId) { setFocusBlockId(prefix.blockId); analyzeAi(prefix.blockId); return; }

        const fuzzy = pages.filter((p) => p.name.toLowerCase().includes(lTitle));
        if (fuzzy.length === 1 && fuzzy[0].blockId) { setFocusBlockId(fuzzy[0].blockId); analyzeAi(fuzzy[0].blockId); return; }

        if (fuzzy.length > 1) {
          console.warn(`navigateToPageByTitle: ambiguous "${title}" → ${fuzzy.map((p) => p.name).join(", ")}`);
        }
      } catch (e) {
        console.error("Page resolve error:", e);
      }
    },
    [analyzeAi]
  );

  if (pagesLoading) {
    return (
      <div className="h-screen bg-bg flex items-center justify-center text-muted text-[13px]">
        connecting to floatty&hellip;
      </div>
    );
  }

  return (
    <div className="h-screen bg-bg text-text flex flex-col overflow-hidden">
      <Header
        blockCount={blockCount}
        selectedCount={selectedIds.size}
        aiOpen={aiOpen}
        onToggleAi={() => setAiOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left: browser panel */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <SidebarTabs
            view={view}
            onViewChange={(v) => {
              setView(v);
              setFocusBlockId(null);
            }}
            pageCount={pages.length}
            ctxCount={ctxCount}
          />

          <ViewErrorBoundary>
          <div className="flex-1 overflow-y-auto">
            {focusBlockId ? (
              <BlockFocus
                blockId={focusBlockId}
                selectedIds={selectedIds}
                onBack={() => setFocusBlockId(null)}
                onAnalyze={analyzeAi}
                onToggleSelect={toggleSelect}
                onNavigate={navigateTo}
                onNavigateToPage={navigateToPageByTitle}
              />
            ) : view === "pages" ? (
              <div>
                <div className="p-1.5 border-b border-border">
                  <input
                    value={pageFilter}
                    onChange={(e) => setPageFilter(e.target.value)}
                    placeholder="filter pages\u2026"
                    className="w-full px-2 py-1 bg-bg border border-border text-text text-[11px] rounded outline-none focus:border-cyan transition-colors"
                  />
                </div>
                <PagesView
                  pages={filteredPages}
                  selectedIds={selectedIds}
                  onToggleSelect={toggleSelect}
                  onNavigate={navigateTo}
                  onAnalyze={analyzeAi}
                  onNavigateToPage={navigateToPageByTitle}
                />
              </div>
            ) : view === "search" ? (
              <SearchView
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
                onNavigate={navigateTo}
              />
            ) : view === "timeline" ? (
              <TimelineView
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
                onNavigate={navigateTo}
              />
            ) : null}
          </div>
          </ViewErrorBoundary>
        </div>

        {/* Right: AI panel */}
        {aiOpen && (
          <div className="shrink-0 border-l border-border flex flex-col relative" style={{ width: aiWidth }}>
            {/* Resize handle */}
            <div
              className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-cyan/20 active:bg-cyan/30 transition-colors z-10"
              onMouseDown={(e) => {
                e.preventDefault();
                dragging.current = true;
                const startX = e.clientX;
                const startW = aiWidth;
                const onMove = (ev: MouseEvent) => {
                  if (!dragging.current) return;
                  const delta = startX - ev.clientX;
                  setAiWidth(Math.max(280, Math.min(800, startW + delta)));
                };
                const onUp = () => {
                  dragging.current = false;
                  document.removeEventListener("mousemove", onMove);
                  document.removeEventListener("mouseup", onUp);
                  document.body.style.cursor = "";
                  document.body.style.userSelect = "";
                };
                document.addEventListener("mousemove", onMove);
                document.addEventListener("mouseup", onUp);
                document.body.style.cursor = "col-resize";
                document.body.style.userSelect = "none";
              }}
            />
            <AiPanel
              key={pageContextId || [...selectedIds].join(",")}
              selectedIds={[...selectedIds]}
              pageContextId={pageContextId}
              onClose={() => {
                setAiOpen(false);
                setPageContextId(null);
              }}
              onNavigateToPage={navigateToPageByTitle}
            />
          </div>
        )}
      </div>
    </div>
  );
}
