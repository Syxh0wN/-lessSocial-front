import { fetchProfileTestimonialsPage } from "@/lib/api";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const username = requestUrl.searchParams.get("username");
  if (!username) {
    return NextResponse.json(
      {
        items: [],
        hasMore: false,
        nextCursor: null,
        totalCount: 0,
      },
      { status: 400 },
    );
  }
  const cursor = requestUrl.searchParams.get("cursor") ?? undefined;
  const rawLimit = Number.parseInt(requestUrl.searchParams.get("limit") ?? "8", 10);
  const limit = Number.isNaN(rawLimit) ? 8 : rawLimit;
  const response = await fetchProfileTestimonialsPage(username, cursor, limit);
  return NextResponse.json(response);
}
