import {
  streamText,
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  stepCountIs,
  type UIMessage,
} from "ai";
import { pipeJsonRender } from "@json-render/core";
import {
  EXPLORER_INSTRUCTIONS,
  EXPLORER_TOOLS,
} from "@/lib/agents/explorer-agent";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      const modelMessages = await convertToModelMessages(messages);

      const result = streamText({
        model: "anthropic/claude-sonnet-4",
        system: EXPLORER_INSTRUCTIONS,
        tools: EXPLORER_TOOLS,
        stopWhen: stepCountIs(5),
        maxOutputTokens: 4000,
        messages: modelMessages,
      });

      // Pipe through json-render transform — extracts ```spec fences as data parts
      writer.merge(pipeJsonRender(result.toUIMessageStream()));
    },
  });

  return createUIMessageStreamResponse({ stream });
}
