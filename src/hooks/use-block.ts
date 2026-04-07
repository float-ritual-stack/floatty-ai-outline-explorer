"use client";

import { useState, useEffect } from "react";
import type { BlockWithContext } from "@/lib/types";

export function useBlock(
  blockId: string | null,
  includes?: string[]
) {
  const [block, setBlock] = useState<BlockWithContext | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!blockId) {
      setBlock(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const params = includes?.length
      ? `?include=${includes.join(",")}`
      : "";

    fetch(`/api/blocks/${blockId}${params}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Block fetch failed: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setBlock(data);
      })
      .catch((e) => console.error("Block fetch error:", e))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [blockId, includes?.join(",")]);

  return { block, loading };
}
