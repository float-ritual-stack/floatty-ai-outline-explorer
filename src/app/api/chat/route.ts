import { createAgentUIStreamResponse } from "ai";
import { explorerAgent } from "@/lib/agents/explorer-agent";

export async function POST(req: Request) {
  const { messages } = await req.json();

  return createAgentUIStreamResponse({
    agent: explorerAgent,
    uiMessages: messages,
  });
}
