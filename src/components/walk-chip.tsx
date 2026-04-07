"use client";

import { Compass } from "lucide-react";

interface WalkChipProps {
  title: string;
  onClick: () => void;
}

export function WalkChip({ title, onClick }: WalkChipProps) {
  return (
    <span
      onClick={onClick}
      className="inline-flex items-center gap-1 bg-purple/10 border border-purple/25 text-purple px-2 py-0.5 rounded text-[11px] cursor-pointer hover:bg-purple/20 transition-colors"
    >
      <Compass size={10} />
      {title}
    </span>
  );
}
