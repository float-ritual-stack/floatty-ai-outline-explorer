import { getStats } from "@/lib/floatty-client";

export async function GET() {
  const stats = await getStats();
  return Response.json(stats);
}
