import { auth } from "@/auth";
import { NextResponse } from "next/server";

function ResolveApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/ls";
}

export async function POST(request: Request) {
  const session = await auth();
  const accessToken = (session?.user as { accessToken?: string } | undefined)?.accessToken;
  if (!accessToken) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const payload = (await request.json().catch(() => null)) as
    | {
        caption?: string;
        visibility?: "public" | "friends" | "private";
        media?: Array<{
          type: "image" | "video";
          url: string;
        }>;
      }
    | null;
  if (!payload?.media || payload.media.length === 0) {
    return NextResponse.json({ error: "media is required" }, { status: 400 });
  }
  const response = await fetch(`${ResolveApiBaseUrl()}/posts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  if (!response.ok) {
    return NextResponse.json({ error: "create post failed" }, { status: response.status });
  }
  const createdPost = (await response.json()) as unknown;
  return NextResponse.json(createdPost);
}
