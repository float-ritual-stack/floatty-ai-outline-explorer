import { tool } from "ai";
import { z } from "zod";
import { searchPages, getBlock } from "../floatty-client";

export const expandPageTool = tool({
  description:
    "Fetch a page's subtree by title. Use when you need to see the content tree of a specific page in the knowledge graph.",
  inputSchema: z.object({
    title: z.string().describe("Page title to look up"),
  }),
  execute: async ({ title }) => {
    const pages = await searchPages(title, 5);
    if (!pages.length) return { error: `Page "${title}" not found` };

    // Find best match
    const exact = pages.find(
      (p) => p.name.toLowerCase() === title.toLowerCase()
    );
    const match = exact ?? pages[0];

    if (!match.blockId) {
      return { error: `Page "${match.name}" is a stub (referenced but not created)` };
    }

    const block = await getBlock(match.blockId, ["tree"]);

    // Serialize tree into readable text
    const lines: string[] = [];
    if (block.tree) {
      for (const node of block.tree.slice(0, 200)) {
        const indent = "  ".repeat(node.depth);
        lines.push(`${indent}${node.content}`);
      }
    }

    return {
      page: match.name,
      blockId: match.blockId,
      blockCount: block.tree?.length ?? 0,
      tree: lines.join("\n"),
    };
  },
});
