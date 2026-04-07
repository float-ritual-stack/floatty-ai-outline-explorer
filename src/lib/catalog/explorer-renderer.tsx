"use client";

import { createRenderer } from "@json-render/react";
import { explorerCatalog } from "./explorer-catalog";
import { colors } from "../constants";
import {
  Compass,
  AlertTriangle,
  Info,
  AlertCircle,
  Search,
  Terminal,
  Paintbrush,
  Link2,
  ChevronRight,
  ExternalLink,
  FileText,
  Sparkles,
  Zap,
  Brain,
  GitBranch,
  Clock,
  ArrowRight,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import { projectColors } from "../constants";

// Icon lookup for string-based icon props from AI specs
const iconMap: Record<string, LucideIcon> = {
  Compass, AlertTriangle, Info, AlertCircle, Search, Terminal,
  Paintbrush, Link2, ChevronRight, ExternalLink, FileText,
  Sparkles, Zap, Brain, GitBranch, Clock, ArrowRight, BarChart3,
};

function resolveIcon(name?: string): LucideIcon | null {
  return name ? iconMap[name] ?? null : null;
}

// Color token resolution — AI sends token names, renderer resolves
function resolveColor(token?: string): string {
  if (!token) return colors.dim;
  return (colors as Record<string, string>)[token] ?? token;
}

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
    const sevColor = severityColors[sev] ?? colors.cyan;

    const gapTypeConfig: Record<string, { icon: LucideIcon; color: string; label: string }> = {
      stub: { icon: AlertTriangle, color: colors.coral, label: "STUB" },
      orphan: { icon: Link2, color: colors.amber, label: "ORPHAN" },
      empty: { icon: FileText, color: colors.muted, label: "EMPTY" },
      asymmetric: { icon: GitBranch, color: colors.purple, label: "ASYM" },
      unanswered: { icon: Zap, color: colors.magenta, label: "Q?" },
    };

    const gt = element.props.gapType;
    const cfg = gt ? gapTypeConfig[gt] : null;
    const Icon = cfg?.icon ?? (sev === "critical" ? AlertCircle : sev === "warning" ? AlertTriangle : Info);
    const iconColor = cfg?.color ?? sevColor;

    return (
      <div
        className="flex items-start gap-2 px-2.5 py-1.5 bg-surface text-[11px] mb-1"
        style={{ borderLeftWidth: 3, borderLeftColor: sevColor, borderRadius: "0 3px 3px 0" }}
      >
        {cfg && (
          <span
            className="flex items-center gap-1 text-[8px] uppercase tracking-wide px-1.5 py-0.5 rounded shrink-0 mt-0.5"
            style={{ color: cfg.color, backgroundColor: `${cfg.color}15`, border: `1px solid ${cfg.color}30` }}
          >
            <cfg.icon size={8} />{cfg.label}
          </span>
        )}
        {!cfg && <Icon size={11} style={{ color: iconColor }} className="mt-0.5 shrink-0" />}
        <div className="flex-1 min-w-0">
          <div className="text-text">{element.props.description}</div>
          {element.props.evidence && (
            <div
              className="text-dim text-[9px] font-mono mt-1 pl-2 leading-relaxed"
              style={{ borderLeft: `2px solid ${cfg?.color ?? sevColor}15` }}
            >
              {element.props.evidence}
            </div>
          )}
        </div>
        {element.props.target && (
          <span
            className="inline-flex items-center gap-1 bg-cyan/10 text-cyan px-1.5 py-0.5 rounded text-[9px] cursor-pointer hover:bg-cyan/20 transition-colors shrink-0"
            data-walk-page={element.props.target}
          >
            <ExternalLink size={8} />{element.props.target}
          </span>
        )}
      </div>
    );
  },

  WalkChip: ({ element }) => (
    <span
      className="inline-flex items-center gap-1 bg-purple/10 border border-purple/25 text-purple px-2 py-0.5 rounded text-[11px] cursor-pointer hover:bg-purple/25 hover:border-purple/40 hover:scale-[1.02] transition-all"
      data-walk-page={element.props.page}
      title={element.props.reason}
    >
      <ArrowRight size={10} />
      {element.props.page}
    </span>
  ),

  Prose: ({ element }) => {
    const parts = element.props.content.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return (
      <div className="text-text text-[11px] leading-relaxed whitespace-pre-wrap break-words px-2 py-1">
        {parts.map((part: string, i: number) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
          }
          if (part.startsWith("`") && part.endsWith("`")) {
            return (
              <code key={i} className="px-1 py-px rounded text-[10px]" style={{ backgroundColor: colors.surface2, color: colors.cyan }}>
                {part.slice(1, -1)}
              </code>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </div>
    );
  },

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

  // ── AI response components (mockup-derived) ──────────────────────

  Chip: ({ element }) => {
    const c = resolveColor(element.props.color);
    const Icon = resolveIcon(element.props.icon);
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono transition-colors"
        style={{
          color: c,
          backgroundColor: `${c}12`,
          border: `1px solid ${c}30`,
          cursor: element.props.clickable ? "pointer" : "default",
        }}
      >
        {Icon && <Icon size={9} />}
        {element.props.label}
      </span>
    );
  },

  SectionLabel: ({ element, children }) => {
    const c = resolveColor(element.props.color);
    const Icon = resolveIcon(element.props.icon);
    return (
      <div>
        <div className="flex items-center gap-1.5 mb-2 mt-4">
          {Icon && <Icon size={11} style={{ color: c }} />}
          <span
            className="text-[9px] font-mono uppercase tracking-widest"
            style={{ color: c }}
          >
            {element.props.label}
          </span>
          <div className="flex-1 h-px" style={{ backgroundColor: `${c}20` }} />
        </div>
        <div className="flex flex-wrap gap-1.5">{children}</div>
      </div>
    );
  },

  ConfidenceDot: ({ element }) => {
    const dotColors: Record<string, string> = {
      high: colors.green,
      medium: colors.amber,
      low: colors.coral,
      partial: colors.purple,
    };
    const c = dotColors[element.props.level] ?? colors.dim;
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-mono" style={{ color: c }}>
        <span
          className="rounded-full"
          style={{ width: 6, height: 6, backgroundColor: c }}
        />
        {element.props.level}
      </span>
    );
  },

  ObservationCard: ({ element }) => {
    const sevColors: Record<string, string> = {
      surprising: colors.magenta,
      structural: colors.cyan,
      gap: colors.coral,
      thread: colors.purple,
      meta: colors.amber,
    };
    const sev = element.props.severity ?? "meta";
    const c = sevColors[sev] ?? colors.muted;
    const links = element.props.links ?? [];

    return (
      <details
        className="mb-1.5 bg-surface rounded-r overflow-hidden"
        style={{ borderLeft: `3px solid ${c}`, border: `1px solid ${colors.border}`, borderLeftWidth: 3, borderLeftColor: c }}
      >
        <summary className="flex items-start gap-2 px-3 py-2 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
          <span className="text-[14px] font-bold font-mono leading-none mt-0.5" style={{ color: c }}>
            {element.props.number}
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-text text-[12px] font-mono font-semibold leading-snug">
              {element.props.title}
            </div>
            <div className="text-muted text-[10px] font-mono mt-0.5 truncate observation-preview">
              {element.props.body.slice(0, 80)}{element.props.body.length > 80 ? "\u2026" : ""}
            </div>
          </div>
          <span
            className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded shrink-0"
            style={{ color: c, backgroundColor: "transparent", border: `1px solid ${c}30` }}
          >
            {sev}
          </span>
          <ChevronRight size={12} className="text-dim mt-0.5 shrink-0 transition-transform [[open]>&]:rotate-90" />
        </summary>
        <div className="px-3 pb-2.5 pl-8">
          <div className="text-text text-[11px] font-mono leading-relaxed mb-2">
            {element.props.body}
          </div>
          {links.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {links.map((l: string) => (
                <span
                  key={l}
                  className="inline-flex items-center gap-1 bg-cyan/10 text-cyan px-1.5 py-0.5 rounded text-[10px] cursor-pointer hover:bg-cyan/20 transition-colors"
                  data-wikilink-target={l}
                >
                  <Link2 size={8} />[[{l}]]
                </span>
              ))}
            </div>
          )}
        </div>
      </details>
    );
  },

  StatPill: ({ element }) => {
    const c = resolveColor(element.props.color);
    return (
      <div
        className="inline-flex flex-col items-center px-2.5 py-1 rounded"
        style={{ backgroundColor: `${c}05`, border: `1px solid ${c}10` }}
      >
        <span className="text-[12px] font-medium font-mono leading-tight" style={{ color: c }}>
          {element.props.value}
        </span>
        <span className="text-[7px] font-mono uppercase tracking-wide leading-tight" style={{ color: colors.dim }}>
          {element.props.label}
        </span>
      </div>
    );
  },

  TimelineEvent: ({ element }) => {
    const c = resolveColor(element.props.color);
    return (
      <div className="flex items-center gap-2 py-0.5">
        <span className="rounded-full shrink-0" style={{ width: 8, height: 8, backgroundColor: c }} />
        <span className="text-muted text-[10px] font-mono w-12 shrink-0">{element.props.time}</span>
        <span className="text-text text-[11px] font-mono">{element.props.label}</span>
      </div>
    );
  },

  PatternCluster: ({ element }) => {
    const c = resolveColor(element.props.color);
    const instances = element.props.instances ?? [];
    const connections = element.props.connections ?? [];
    return (
      <div
        className="p-2.5 rounded-md mb-1.5"
        style={{ backgroundColor: `${c}06`, border: `1px solid ${c}20` }}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <span
            className="rounded-full"
            style={{ width: 10, height: 10, backgroundColor: c, boxShadow: `0 0 8px ${c}40` }}
          />
          <span className="text-[12px] font-mono font-bold" style={{ color: c }}>
            {element.props.name}
          </span>
          <span className="text-dim text-[9px] font-mono ml-auto">
            {instances.length} instance{instances.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex gap-1 flex-wrap mb-1.5">
          {instances.map((inst: string) => (
            <span key={inst} className="text-muted text-[10px] font-mono px-1.5 py-0.5 bg-surface2 rounded">
              {inst}
            </span>
          ))}
        </div>
        {connections.length > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <ArrowRight size={9} className="text-dim" />
            <span className="text-dim text-[9px] font-mono">connects to:</span>
            {connections.map((conn: string) => (
              <span
                key={conn}
                className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                style={{ color: colors.dim, backgroundColor: `${colors.dim}12`, border: `1px solid ${colors.dim}30` }}
              >
                {conn}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  },

  EnrichedStepCard: ({ element }) => {
    const toolColors: Record<string, string> = {
      expand_page: colors.cyan,
      search_blocks: colors.amber,
      get_inbound: colors.purple,
      get_block: colors.green,
      suggest_walks: colors.magenta,
      qmd_search: colors.coral,
    };
    const c = toolColors[element.props.tool] ?? colors.dim;
    return (
      <details className="mb-1.5">
        <summary
          className="flex items-start gap-2 px-2.5 py-1.5 bg-surface cursor-pointer list-none [&::-webkit-details-marker]:hidden"
          style={{ borderLeft: `3px solid ${c}`, borderRadius: "0 4px 4px 0" }}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] font-mono uppercase font-semibold" style={{ color: c }}>
                {element.props.tool}
              </span>
              <span className="text-text text-[11px] font-mono">{element.props.target}</span>
            </div>
            {element.props.reason && (
              <div className="text-dim text-[10px] font-mono">{element.props.reason}</div>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {element.props.result && (
              <span className="text-muted text-[10px] font-mono">{element.props.result}</span>
            )}
            {element.props.preview && (
              <span className="text-[9px] font-mono underline" style={{ color: c }}>
                preview
              </span>
            )}
          </div>
        </summary>
        {element.props.preview && (
          <div
            className="px-2.5 py-1.5 bg-bg text-muted text-[10px] font-mono leading-relaxed whitespace-pre-wrap max-h-[120px] overflow-y-auto"
            style={{ borderLeft: `3px solid ${c}30`, borderRadius: "0 0 4px 0" }}
          >
            {element.props.preview}
          </div>
        )}
      </details>
    );
  },

  // ── Typography primitives ────────────────────────────────────────

  Heading: ({ element }) => {
    const level = element.props.level ?? 1;
    const styles: Record<number, { size: string; color: string; weight: string }> = {
      1: { size: "text-[16px]", color: colors.cyan, weight: "font-bold" },
      2: { size: "text-[13px]", color: colors.text, weight: "font-semibold" },
      3: { size: "text-[11px]", color: colors.muted, weight: "font-semibold" },
    };
    const s = styles[level] ?? styles[3];
    return (
      <div className={`${s.size} ${s.weight} font-mono leading-snug mt-3 mb-1.5`} style={{ color: s.color }}>
        {element.props.content}
      </div>
    );
  },

  Paragraph: ({ element }) => {
    // Parse **bold** and `code` inline markers
    const parts = element.props.content.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return (
      <p className="text-text text-[11px] font-mono leading-relaxed mb-2">
        {parts.map((part: string, i: number) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={i} className="text-text font-bold">{part.slice(2, -2)}</strong>;
          }
          if (part.startsWith("`") && part.endsWith("`")) {
            return (
              <code key={i} className="px-1 py-px rounded text-[10px]" style={{ backgroundColor: colors.surface2, color: colors.cyan }}>
                {part.slice(1, -1)}
              </code>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </p>
    );
  },

  Bold: ({ element }) => (
    <strong className="text-text text-[11px] font-mono font-bold">{element.props.content}</strong>
  ),

  InlineCode: ({ element }) => (
    <code className="px-1 py-px rounded text-[10px] font-mono" style={{ backgroundColor: colors.surface2, color: colors.cyan }}>
      {element.props.content}
    </code>
  ),

  BulletList: ({ element }) => (
    <ul className="text-text text-[11px] font-mono leading-relaxed mb-2 pl-4">
      {(element.props.items ?? []).map((item: string, i: number) => (
        <li key={i} className="mb-0.5" style={{ listStyleType: "disc" }}>{item}</li>
      ))}
    </ul>
  ),

  StatusLine: ({ element }) => {
    const c = resolveColor(element.props.color);
    return (
      <div className="text-[11px] font-mono leading-relaxed mb-1.5">
        <span style={{ color: c }} className="font-bold">▸ {element.props.label}: </span>
        <span className="text-text">{element.props.content}</span>
      </div>
    );
  },

  Divider: () => (
    <hr className="my-3" style={{ borderColor: `${colors.border}80`, borderTopWidth: 1 }} />
  ),

  // ── Rich visualizations ──────────────────────────────────────────

  LinkGraph: ({ element }) => {
    const nodes = element.props.nodes ?? [];
    const edges = element.props.edges ?? [];
    const w = 420, h = 260;

    // Radial layout
    const centerNode = nodes.find((n: { center?: boolean }) => n.center);
    const others = nodes.filter((n: { center?: boolean }) => !n.center);
    const positioned: Record<string, { x: number; y: number; color: string; label: string; weight?: number; type?: string; center?: boolean }> = {};
    if (centerNode) positioned[centerNode.id] = { ...centerNode, x: w / 2, y: h / 2, color: resolveColor(centerNode.color) };
    others.forEach((n: { id: string; color?: string; ring?: number; label: string; weight?: number; type?: string }, i: number) => {
      const angle = (i / others.length) * Math.PI * 2 - Math.PI / 2;
      const r = 90 + (n.ring || 1) * 30;
      positioned[n.id] = { ...n, x: w / 2 + Math.cos(angle) * r, y: h / 2 + Math.sin(angle) * r, color: resolveColor(n.color) };
    });

    return (
      <div className="bg-surface rounded-md overflow-hidden" style={{ border: `1px solid ${colors.border}` }}>
        <svg width={w} height={h} style={{ display: "block" }}>
          {edges.map((edge: string[], i: number) => {
            const a = positioned[edge[0]], b = positioned[edge[1]];
            if (!a || !b) return null;
            return (
              <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={colors.border} strokeWidth={0.5}
                strokeDasharray={a.type === "stub" || b.type === "stub" ? "3,3" : "none"}
              />
            );
          })}
          {Object.values(positioned).map((n) => {
            const r = n.center ? 18 : n.type === "stub" ? 5 : 8 + Math.min(n.weight || 0, 6);
            return (
              <g key={n.label}>
                <circle cx={n.x} cy={n.y} r={r}
                  fill={n.color + "30"} stroke={n.color}
                  strokeWidth={n.center ? 2 : 1}
                />
                {(n.center || r > 8) && (
                  <text x={n.x} y={n.y + r + 12} textAnchor="middle"
                    fill={colors.muted} fontSize={8} fontFamily="monospace"
                  >{n.label.length > 18 ? n.label.slice(0, 16) + "\u2026" : n.label}</text>
                )}
                {(n.weight ?? 0) > 3 && !n.center && (
                  <text x={n.x} y={n.y + 3} textAnchor="middle"
                    fill={colors.bg} fontSize={7} fontFamily="monospace" fontWeight="bold"
                  >{n.weight}</text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    );
  },

  ActivityHeatmap: ({ element }) => {
    const data = element.props.data ?? [];
    const c = resolveColor(element.props.color ?? "cyan");
    const maxVal = Math.max(...data.map((d: { value: number }) => d.value), 1);
    return (
      <div className="bg-surface rounded-md p-2" style={{ border: `1px solid ${colors.border}` }}>
        <div className="flex gap-0.5 flex-wrap p-1">
          {data.map((d: { label: string; value: number }, i: number) => {
            const intensity = d.value / maxVal;
            const bg = intensity === 0 ? colors.surface2
              : intensity < 0.25 ? c + "15"
              : intensity < 0.5 ? c + "30"
              : intensity < 0.75 ? c + "50"
              : c + "80";
            return (
              <div key={i} title={`${d.label}: ${d.value}`} style={{
                width: 14, height: 14, borderRadius: 2, backgroundColor: bg,
                border: `1px solid ${intensity > 0.5 ? c + "30" : colors.border}`,
              }} />
            );
          })}
        </div>
        <div className="flex justify-between px-1 mt-0.5">
          <span className="text-dim text-[8px] font-mono">{data[0]?.label}</span>
          <span className="text-dim text-[8px] font-mono">peak: {maxVal}</span>
          <span className="text-dim text-[8px] font-mono">{data[data.length - 1]?.label}</span>
        </div>
      </div>
    );
  },

  ProvenanceChain: ({ element }) => {
    const steps = element.props.steps ?? [];
    const sourceColors: Record<string, string> = {
      qmd: colors.cyan, conversation: colors.magenta, bbs: colors.purple,
      outline: colors.green, loki: colors.amber, autorag: colors.cyan,
    };
    return (
      <div className="bg-surface rounded-md p-2.5" style={{ border: `1px solid ${colors.border}` }}>
        {steps.map((step: { source: string; content: string; docId?: string; confidence?: number; lines?: string }, i: number) => {
          const sc = sourceColors[step.source] ?? colors.dim;
          const isLast = i === steps.length - 1;
          return (
            <div key={i} className="flex gap-2.5" style={{ marginBottom: isLast ? 0 : 4 }}>
              <div className="flex flex-col items-center shrink-0" style={{ width: 16 }}>
                <div className="shrink-0 mt-1 rounded-full" style={{ width: 10, height: 10, backgroundColor: sc + "30", border: `2px solid ${sc}` }} />
                {!isLast && <div className="flex-1 mt-0.5" style={{ width: 2, backgroundColor: colors.border }} />}
              </div>
              <div className="flex-1" style={{ paddingBottom: isLast ? 0 : 8 }}>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[8px] font-mono uppercase tracking-wide px-1.5 py-px rounded" style={{ color: sc, backgroundColor: sc + "12" }}>
                    {step.source}
                  </span>
                  {step.docId && <span className="text-dim text-[9px] font-mono">#{step.docId}</span>}
                  {step.confidence != null && (
                    <span className="text-[9px] font-mono ml-auto" style={{
                      color: step.confidence > 0.8 ? colors.green : step.confidence > 0.5 ? colors.amber : colors.coral,
                    }}>{Math.round(step.confidence * 100)}%</span>
                  )}
                </div>
                <div className="text-text text-[11px] font-mono leading-snug">{step.content}</div>
                {step.lines && <span className="text-dim text-[9px] font-mono">lines {step.lines}</span>}
              </div>
            </div>
          );
        })}
      </div>
    );
  },

  RiskMatrix: ({ element }) => {
    const items = element.props.items ?? [];
    const rows = ["high", "medium", "low"] as const;
    const cols = ["structural", "content", "cosmetic"] as const;
    const colColors: Record<string, string> = { structural: colors.coral, content: colors.amber, cosmetic: colors.muted };

    return (
      <div className="bg-surface rounded-md overflow-hidden" style={{ border: `1px solid ${colors.border}` }}>
        <div className="grid" style={{ gridTemplateColumns: "60px 1fr 1fr 1fr", borderBottom: `1px solid ${colors.border}` }}>
          <div className="p-1.5" />
          {cols.map(c => (
            <div key={c} className="p-1.5 text-center text-[9px] font-mono uppercase" style={{ color: colColors[c], borderLeft: `1px solid ${colors.border}` }}>
              {c}
            </div>
          ))}
        </div>
        {rows.map(r => (
          <div key={r} className="grid" style={{ gridTemplateColumns: "60px 1fr 1fr 1fr", borderBottom: `1px solid ${colors.border}20` }}>
            <div className="p-1.5 text-[9px] font-mono uppercase flex items-center" style={{
              color: r === "high" ? colors.coral : r === "medium" ? colors.amber : colors.muted,
            }}>{r}</div>
            {cols.map(c => {
              const cellItems = items.filter((it: { severity: string; impact: string }) => it.severity === r && it.impact === c);
              const cc = colColors[c];
              return (
                <div key={c} className="p-1 flex flex-col gap-0.5" style={{ borderLeft: `1px solid ${colors.border}`, minHeight: 40 }}>
                  {cellItems.map((item: { label: string }, idx: number) => (
                    <div key={idx} className="px-1.5 py-0.5 rounded text-[9px] font-mono text-text leading-snug" style={{
                      backgroundColor: cc + "10", borderLeft: `2px solid ${cc}40`,
                    }}>{item.label}</div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  },

  TimelineDiff: ({ element }) => {
    const before = element.props.before ?? { date: "", items: [] };
    const after = element.props.after ?? { date: "", items: [] };
    return (
      <div className="grid bg-surface rounded-md overflow-hidden" style={{ gridTemplateColumns: "1fr 20px 1fr", border: `1px solid ${colors.border}` }}>
        <div className="p-1.5" style={{ borderBottom: `1px solid ${colors.border}`, backgroundColor: colors.coral + "08" }}>
          <span className="text-[9px] font-mono uppercase" style={{ color: colors.coral }}>before</span>
          <span className="text-dim text-[9px] font-mono ml-1.5">{before.date}</span>
        </div>
        <div className="flex items-center justify-center" style={{ borderBottom: `1px solid ${colors.border}` }}>
          <ArrowRight size={10} className="text-dim" />
        </div>
        <div className="p-1.5" style={{ borderBottom: `1px solid ${colors.border}`, backgroundColor: colors.green + "08" }}>
          <span className="text-[9px] font-mono uppercase" style={{ color: colors.green }}>after</span>
          <span className="text-dim text-[9px] font-mono ml-1.5">{after.date}</span>
        </div>
        <div className="p-1.5">
          {before.items.map((item: { text: string; removed?: boolean }, i: number) => (
            <div key={i} className="px-1.5 py-0.5 text-[10px] font-mono mb-0.5" style={{
              color: colors.muted,
              backgroundColor: item.removed ? colors.coral + "10" : "transparent",
              textDecoration: item.removed ? "line-through" : "none",
              borderLeft: item.removed ? `2px solid ${colors.coral}40` : "2px solid transparent",
            }}>{item.text}</div>
          ))}
        </div>
        <div />
        <div className="p-1.5">
          {after.items.map((item: { text: string; added?: boolean }, i: number) => (
            <div key={i} className="px-1.5 py-0.5 text-[10px] font-mono mb-0.5" style={{
              color: item.added ? colors.green : colors.muted,
              backgroundColor: item.added ? colors.green + "08" : "transparent",
              borderLeft: item.added ? `2px solid ${colors.green}40` : "2px solid transparent",
            }}>{item.text}</div>
          ))}
        </div>
      </div>
    );
  },

  // ── Block primitives ─────────────────────────────────────────────

  HeadingBlock: ({ element, children }) => {
    const styles: Record<string, { size: string; color: string }> = {
      h1: { size: "text-[14px]", color: colors.cyan },
      h2: { size: "text-[12px]", color: colors.green },
      h3: { size: "text-[11px]", color: colors.amber },
    };
    const s = styles[element.props.level] ?? styles.h3;
    return (
      <div className={`${s.size} font-bold leading-snug`} style={{ color: s.color }}>
        {element.props.content}
        {children}
      </div>
    );
  },

  ContextMarker: ({ element }) => {
    const project = element.props.project;
    const projColor = project ? projectColors[project] ?? colors.dim : null;
    return (
      <div
        className="flex items-center gap-1.5 px-2 py-0.5 text-[11px]"
        style={{ borderLeftWidth: 2, borderLeftColor: colors.magenta }}
      >
        {element.props.timestamp && (
          <span className="text-muted text-[10px] shrink-0">
            {element.props.timestamp}
          </span>
        )}
        {project && (
          <span
            className="text-[9px] uppercase px-1 py-px rounded"
            style={{ color: projColor!, backgroundColor: `${projColor!}15` }}
          >
            {project}
          </span>
        )}
        {element.props.mode && (
          <span className="text-dim text-[9px]">{element.props.mode}</span>
        )}
        <span className="text-text truncate">
          {element.props.content
            .replace(/^ctx::\s*/, "")
            .replace(/\d{4}-\d{2}-\d{2}\s*@?\s*\d{1,2}:\d{2}\s*(AM|PM)?\s*/i, "")
            .replace(/\[project::[^\]]*\]\s*/g, "")
            .replace(/\[mode::[^\]]*\]\s*/g, "")
            .trim() || "ctx"}
        </span>
      </div>
    );
  },

  ShellCommand: ({ element, children }) => (
    <div
      className="px-2 py-0.5 text-[11px]"
      style={{ borderLeftWidth: 2, borderLeftColor: colors.coral }}
    >
      <div className="flex items-center gap-1">
        <Terminal size={10} style={{ color: colors.coral }} className="shrink-0" />
        <code className="text-text font-mono">
          {element.props.command}
        </code>
        {element.props.hasOutput && (
          <span className="text-dim text-[9px] ml-auto shrink-0">has output</span>
        )}
      </div>
      {children}
    </div>
  ),

  RenderPrompt: ({ element }) => (
    <div
      className="px-2 py-0.5 text-[11px]"
      style={{ borderLeftWidth: 2, borderLeftColor: colors.purple }}
    >
      <div className="flex items-center gap-1">
        <Paintbrush size={10} style={{ color: colors.purple }} className="shrink-0" />
        <span className="text-purple text-[9px] uppercase font-bold shrink-0">render</span>
        <span className="text-text italic truncate">{element.props.prompt}</span>
      </div>
    </div>
  ),

  SearchQuery: ({ element }) => (
    <div
      className="px-2 py-0.5 text-[11px]"
      style={{ borderLeftWidth: 2, borderLeftColor: colors.cyan }}
    >
      <div className="flex items-center gap-1">
        <Search size={10} style={{ color: colors.cyan }} className="shrink-0" />
        <span className="text-text">{element.props.query}</span>
        {element.props.resultCount != null && (
          <span className="text-dim text-[9px] ml-auto shrink-0">
            {element.props.resultCount} results
          </span>
        )}
      </div>
    </div>
  ),

  WikilinkChip: ({ element }) => (
    <span
      className="inline-flex items-center gap-1 bg-cyan/10 text-cyan px-1.5 py-0.5 rounded text-[10px] cursor-pointer hover:bg-cyan/20 transition-colors"
      data-wikilink-target={element.props.target}
    >
      [[{element.props.target}]]
    </span>
  ),

  OutlinerBlock: ({ element, children }) => (
    <div className="text-text text-[11px] whitespace-pre-wrap break-words">
      {element.props.content}
      {children}
    </div>
  ),
});
