import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { z } from "zod";

export const explorerCatalog = defineCatalog(schema, {
  components: {
    Section: {
      props: z.object({
        title: z.string().describe("Section heading"),
        variant: z
          .enum(["default", "highlight", "warning"])
          .optional()
          .describe("Visual style"),
      }),
      slots: ["default"],
      description:
        "A collapsible analysis section with a heading. Use for major findings.",
    },

    PatternCard: {
      props: z.object({
        label: z.string().describe("Pattern name"),
        description: z.string().describe("What this pattern means"),
        confidence: z
          .enum(["high", "medium", "low"])
          .optional()
          .describe("How confident you are"),
      }),
      description:
        "A card showing a discovered pattern, theme, or recurring element.",
    },

    BlockRef: {
      props: z.object({
        title: z.string().describe("Display text for the block reference"),
        blockId: z.string().optional().describe("Block UUID if known"),
        page: z.string().optional().describe("Page title for navigation"),
      }),
      description:
        "A clickable reference to a block or page in the graph. Renders as a wikilink-style chip.",
    },

    GapItem: {
      props: z.object({
        description: z.string().describe("What's missing or incomplete"),
        severity: z
          .enum(["info", "warning", "critical"])
          .optional()
          .describe("How important this gap is"),
      }),
      description:
        "An identified gap: missing content, orphan link, unanswered question, empty stub.",
    },

    WalkChip: {
      props: z.object({
        page: z.string().describe("Page title to suggest exploring"),
        reason: z.string().optional().describe("Why this page is worth visiting"),
      }),
      description:
        "A clickable suggestion for the next page to explore. Renders as a compact chip.",
    },

    Prose: {
      props: z.object({
        content: z.string().describe("Markdown-ish text content"),
      }),
      description:
        "A block of analysis text. Use for narrative explanations between structured components.",
    },

    StepIndicator: {
      props: z.object({
        tool: z.string().describe("Tool name that was called"),
        target: z.string().describe("What was fetched"),
        result: z.string().optional().describe("Brief result summary"),
      }),
      description:
        "Shows a tool call step: what was fetched and why. Renders as a compact status line.",
    },
  },
  actions: {},
});
