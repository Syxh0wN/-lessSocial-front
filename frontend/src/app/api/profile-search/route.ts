import { fetchProfileSearch } from "@/lib/api";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const query = requestUrl.searchParams.get("query") ?? "";
  const suggestions = await fetchProfileSearch(query);
  return NextResponse.json(suggestions);
}
