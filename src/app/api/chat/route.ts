import {
  streamText,
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  stepCountIs,
  wrapLanguageModel,
  gateway,
  type UIMessage,
  type ModelMessage,
} from "ai";
import { z } from "zod";
import { devToolsMiddleware } from "@ai-sdk/devtools";
import { pipeJsonRender } from "@json-render/core";
import {
  EXPLORER_INSTRUCTIONS,
  EXPLORER_TOOLS,
} from "@/lib/agents/explorer-agent";

const requestSchema = z.object({
  messages: z.array(z.any()),
  maxSteps: z.number().int().min(1).max(20).optional(),
  maxTokens: z.number().int().min(500).max(16000).optional(),
});

/**
 * Filter empty text content blocks that cause Anthropic API errors.
 * The AI SDK types don't account for this edge case, so we use a
 * targeted type assertion on the content array only.
 */
function filterEmptyTextParts(msgs: ModelMessage[]): ModelMessage[] {
  for (const msg of msgs) {
    if (Array.isArray(msg.content)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const parts = msg.content as any[];
      const filtered = parts.filter(
        (part: { type: string; text?: string }) =>
          !(part.type === "text" && part.text === "")
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (msg as any).content = filtered;
    }
  }
  return msgs.filter(
    (msg) => !Array.isArray(msg.content) || msg.content.length > 0
  );
}

export async function POST(req: Request) {
  const body = requestSchema.parse(await req.json());
  const messages = body.messages as UIMessage[];
  const steps = body.maxSteps ?? 8;
  const tokens = body.maxTokens ?? 4000;

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      const modelMessages = await convertToModelMessages(messages);
      const filteredMessages = filterEmptyTextParts(modelMessages);

      const model = wrapLanguageModel({
        model: gateway("anthropic/claude-sonnet-4"),
        middleware: devToolsMiddleware(),
      });

      const result = streamText({
        model,
        system: EXPLORER_INSTRUCTIONS,
        tools: EXPLORER_TOOLS,
        stopWhen: stepCountIs(steps),
        maxOutputTokens: tokens,
        messages: filteredMessages,
        onFinish({ finishReason }) {
          writer.write({
            type: "data-step-status" as `data-${string}`,
            data: { finishReason, maxSteps: steps },
          });
        },
      });

      // Pipe through json-render transform — extracts ```spec fences as data parts
      writer.merge(pipeJsonRender(result.toUIMessageStream()));
    },
  });

  return createUIMessageStreamResponse({ stream });
}
