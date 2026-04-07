import { listBlocks } from "@/lib/floatty-client";

export async function GET() {
  const data = await listBlocks();
  return Response.json(data);
}
