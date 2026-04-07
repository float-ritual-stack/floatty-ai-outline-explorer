import { getTopology } from "@/lib/floatty-client";

export async function GET() {
  const topology = await getTopology();
  return Response.json(topology);
}
