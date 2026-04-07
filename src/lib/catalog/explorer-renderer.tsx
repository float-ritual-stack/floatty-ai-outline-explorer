"use client";

import { createRenderer } from "@json-render/react";
import { explorerCatalog } from "./explorer-catalog";
import { colors } from "../constants";
import { Compass, AlertTriangle, Info, AlertCircle } from "lucide-react";

const severityColors: Record<string, string> = {
  info: colors.cyan,
  warning: colors.amber,
  critical: colors.red,
};

const confidenceColors: Record<string, string> = {
  high: colors.green,
  medium: colors.amber,
  low: colors.coral,
};

const variantStyles: Record<string, { borderColor: string; bg: string }> = {
  default: { borderColor: colors.border, bg: "" },
  highlight: { borderColor: colors.cyan, bg: "bg-cyan/5" },
  warning: { borderColor: colors.amber, bg: "bg-amber/5" },
};

export const ExplorerRenderer = createRenderer(explorerCatalog, {
  Section: ({ element, children }) => {
    const style = variantStyles[element.props.variant ?? "default"];
    return (
      <div
        className={`mb-3 ${style.bg}`}
        style={{ borderLeftWidth: 2, borderLeftColor: style.borderColor }}
      >
        <div className="px-2.5 py-1.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-cyan mb-1.5">
            {element.props.title}
          </div>
          <div className="space-y-1.5">{children}</div>
        </div>
      </div>
    );
  },

  PatternCard: ({ element }) => {
    const conf = element.props.confidence ?? "medium";
    return (
      <div
        className="px-2.5 py-1.5 bg-surface rounded mb-1"
        style={{
          borderLeftWidth: 2,
          borderLeftColor: confidenceColors[conf] ?? colors.amber,
        }}
      >
        <div className="flex items-center gap-1.5">
          <span
            className="text-[10px] font-bold"
            style={{ color: confidenceColors[conf] ?? colors.amber }}
          >
            {element.props.label}
          </span>
          {element.props.confidence && (
            <span className="text-dim text-[8px] uppercase">
              {element.props.confidence}
            </span>
          )}
        </div>
        <div className="text-text text-[11px] mt-0.5 leading-relaxed">
          {element.props.description}
        </div>
      </div>
    );
  },

  BlockRef: ({ element }) => (
    <span
      className="inline-flex items-center gap-1 bg-cyan/10 text-cyan px-1.5 py-0.5 rounded text-[10px] cursor-pointer hover:bg-cyan/20 transition-colors"
      data-page={element.props.page}
      data-block-id={element.props.blockId}
    >
      [[{element.props.title}]]
    </span>
  ),

  GapItem: ({ element }) => {
    const sev = element.props.severity ?? "info";
    const color = severityColors[sev] ?? colors.cyan;
    const Icon =
      sev === "critical"
        ? AlertCircle
        : sev === "warning"
          ? AlertTriangle
          : Info;
    return (
      <div className="flex items-start gap-1.5 px-2 py-1 text-[11px]">
        <Icon size={11} style={{ color }} className="mt-0.5 shrink-0" />
        <span className="text-text">{element.props.description}</span>
      </div>
    );
  },

  WalkChip: ({ element }) => (
    <span
      className="inline-flex items-center gap-1 bg-purple/10 border border-purple/25 text-purple px-2 py-0.5 rounded text-[11px] cursor-pointer hover:bg-purple/20 transition-colors"
      data-walk-page={element.props.page}
      title={element.props.reason}
    >
      <Compass size={10} />
      {element.props.page}
    </span>
  ),

  Prose: ({ element }) => (
    <div className="text-text text-[11px] leading-relaxed whitespace-pre-wrap break-words px-2 py-1">
      {element.props.content}
    </div>
  ),

  StepIndicator: ({ element }) => (
    <div
      className="flex items-center gap-2 px-2 py-1 bg-surface text-[10px] mb-0.5"
      style={{ borderLeftWidth: 2, borderLeftColor: colors.amber }}
    >
      <span className="text-amber uppercase font-bold">
        {element.props.tool}
      </span>
      <span className="text-text">{element.props.target}</span>
      {element.props.result && (
        <span className="text-muted ml-auto">{element.props.result}</span>
      )}
    </div>
  ),
});
