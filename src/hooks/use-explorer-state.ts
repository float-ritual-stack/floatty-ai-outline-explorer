"use client";

import { useState, useCallback } from "react";
import type { ViewMode } from "@/lib/types";

export interface ExplorerState {
  view: ViewMode;
  focusBlockId: string | null;
  selectedIds: Set<string>;
  pageContextId: string | null;
  aiOpen: boolean;
  pageFilter: string;

  setView: (v: ViewMode) => void;
  setFocusBlockId: (id: string | null) => void;
  setPageFilter: (f: string) => void;

  toggleSelect: (id: string) => void;
  navigateTo: (id: string) => void;
  analyzeAi: (id: string) => void;
  navigateToPageByTitle: (title: string) => Promise<void>;
  closeAi: () => void;
  openAi: () => void;
}

export function useExplorerState(): ExplorerState {
  const [view, setViewRaw] = useState<ViewMode>("pages");
  const [focusBlockId, setFocusBlockId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pageContextId, setPageContextId] = useState<string | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [pageFilter, setPageFilter] = useState("");

  const setView = useCallback((v: ViewMode) => {
    setViewRaw(v);
    setFocusBlockId(null);
  }, []);

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
          `/api/pages/resolve?title=${encodeURIComponent(title)}`
        );
        if (!res.ok) return;
        const data = await res.json();
        if (data.blockId) {
          setFocusBlockId(data.blockId);
          analyzeAi(data.blockId);
        }
      } catch (e) {
        console.error("Page resolve error:", e);
      }
    },
    [analyzeAi]
  );

  const closeAi = useCallback(() => {
    setAiOpen(false);
    setPageContextId(null);
  }, []);

  const openAi = useCallback(() => setAiOpen(true), []);

  return {
    view,
    focusBlockId,
    selectedIds,
    pageContextId,
    aiOpen,
    pageFilter,
    setView,
    setFocusBlockId,
    setPageFilter,
    toggleSelect,
    navigateTo,
    analyzeAi,
    navigateToPageByTitle,
    closeAi,
    openAi,
  };
}
