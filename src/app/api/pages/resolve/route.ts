import type { NextRequest } from "next/server";
import { resolvePageTitle } from "@/lib/page-resolver";

export async function GET(request: NextRequest) {
  const title = request.nextUrl.searchParams.get("title") ?? "";
  if (!title) {
    return Response.json({ error: "title is required" }, { status: 400 });
  }

  try {
    const result = await resolvePageTitle(title);
    if (!result) {
      return Response.json({ error: `No page found for "${title}"` }, { status: 404 });
    }
    return Response.json(result);
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 502 });
  }
}
