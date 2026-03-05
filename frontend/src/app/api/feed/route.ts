import { auth } from "@/auth";
import { fetchFeedPage } from "@/lib/api";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth();
  const sessionUser = session?.user as { accessToken?: string } | undefined;
  const requestUrl = new URL(request.url);
  const cursor = requestUrl.searchParams.get("cursor") ?? undefined;
  const rawLimit = Number.parseInt(requestUrl.searchParams.get("limit") ?? "10", 10);
  const limit = Number.isNaN(rawLimit) ? 10 : rawLimit;

  if (!sessionUser?.accessToken) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const feedPage = await fetchFeedPage(cursor, limit, sessionUser.accessToken);
  return NextResponse.json(feedPage);
}
