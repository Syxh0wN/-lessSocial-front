import { fetchProfilePreview } from "@/lib/api";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const username = requestUrl.searchParams.get("username") ?? "";
  if (!username) {
    return NextResponse.json({ error: "username is required" }, { status: 400 });
  }
  const profilePreview = await fetchProfilePreview(username);
  if (!profilePreview) {
    return NextResponse.json({ error: "profile not found" }, { status: 404 });
  }
  return NextResponse.json(profilePreview);
}
