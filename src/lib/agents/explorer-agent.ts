import { ToolLoopAgent, stepCountIs, InferAgentUIMessage } from "ai";
import { expandPageTool } from "../tools/expand-page";
import { searchBlocksTool } from "../tools/search-blocks";
import { getInboundTool } from "../tools/get-inbound";
import { suggestWalksTool } from "../tools/suggest-walks";

const GRAPH_PREAMBLE = `You are analyzing nodes in a 21,000+ block knowledge graph called floatty — a terminal outliner used as a cognitive prosthetic.

GRAPH VOCABULARY:
- [[wikilink]] = edge to another page in the graph
- ctx:: = timestamped event marker
- project:: mode:: type:: = metadata tags
- sh:: = executable shell command (output appears as child)
- render:: = trigger for render agent (content after render:: is a PROMPT, not an error or corruption)
- search:: pick:: = executable query blocks
- linear:: issue:: = issue tracker links

When you see "render:: agent seven sluts float into a hot tub" that's someone typing a creative prompt to a render agent, not pipeline corruption.

You have tools to explore the graph:
- expand_page: fetch a page's full subtree by title
- search_blocks: full-text search across all blocks
- get_inbound: find blocks that link TO a target via [[wikilinks]]
- suggest_walks: at the end of your analysis, suggest pages to explore next

Use these tools when you need more context. Don't guess — look things up.
After your analysis, call suggest_walks with 2-5 related pages worth exploring.`;

export const explorerAgent = new ToolLoopAgent({
  model: "anthropic/claude-sonnet-4",
  instructions: GRAPH_PREAMBLE,
  tools: {
    expand_page: expandPageTool,
    search_blocks: searchBlocksTool,
    get_inbound: getInboundTool,
    suggest_walks: suggestWalksTool,
  },
  stopWhen: stepCountIs(5),
});

export type ExplorerUIMessage = InferAgentUIMessage<typeof explorerAgent>;
