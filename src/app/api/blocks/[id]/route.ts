import type { NextRequest } from "next/server";
import { getBlock } from "@/lib/floatty-client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const include = request.nextUrl.searchParams.get("include");
  const includes = include ? include.split(",") : undefined;
  const block = await getBlock(id, includes);
  return Response.json(block);
}
