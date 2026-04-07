"use client";

import { useState, useEffect } from "react";
import type { PageListItem, TopologyResponse } from "@/lib/types";

export function usePages() {
  const [pages, setPages] = useState<PageListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [blockCount, setBlockCount] = useState(0);

  useEffect(() => {
    fetch("/api/topology")
      .then((res) => {
        if (!res.ok) throw new Error(`Topology fetch failed: ${res.status}`);
        return res.json() as Promise<TopologyResponse>;
      })
      .then((topo) => {
        const items: PageListItem[] = topo.n
          .map((node) => ({
            name: node.id,
            blockId: null as string | null, // resolved via pages/search when needed
            blockCount: node.b,
            isStub: false,
          }))
          .sort((a, b) => b.blockCount - a.blockCount);
        setPages(items);
        setBlockCount(topo.meta.blocks);
      })
      .catch((e) => console.error("Topology fetch error:", e))
      .finally(() => setLoading(false));
  }, []);

  return { pages, loading, blockCount };
}

export function usePageFilter(pages: PageListItem[], filter: string) {
  if (!filter) return pages;
  const q = filter.toLowerCase();
  return pages.filter((p) => p.name.toLowerCase().includes(q));
}
