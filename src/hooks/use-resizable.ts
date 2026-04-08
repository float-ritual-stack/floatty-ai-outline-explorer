"use client";

import { useState, useRef } from "react";

interface ResizableOptions {
  initialWidth: number;
  min?: number;
  max?: number;
  /** Direction: "left" means dragging left increases width (right panel), "right" means dragging right increases width */
  direction?: "left" | "right";
}

export function useResizable({ initialWidth, min = 200, max = 1000, direction = "left" }: ResizableOptions) {
  const [width, setWidth] = useState(initialWidth);
  const dragging = useRef(false);

  function onMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    dragging.current = true;
    const startX = e.clientX;
    const startW = width;

    const onMove = (ev: MouseEvent) => {
      if (!dragging.current) return;
      const delta = direction === "left" ? startX - ev.clientX : ev.clientX - startX;
      setWidth(Math.max(min, Math.min(max, startW + delta)));
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
  }

  return { width, onMouseDown };
}
