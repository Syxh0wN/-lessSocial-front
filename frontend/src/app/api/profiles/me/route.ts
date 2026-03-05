import { auth } from "@/auth";
import { NextResponse } from "next/server";

function ResolveApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";
}

export async function PATCH(request: Request) {
  const session = await auth();
  const accessToken = (session?.user as { accessToken?: string } | undefined)?.accessToken;
  if (!accessToken) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const payload = (await request.json().catch(() => null)) as
    | {
        username?: string;
        name?: string;
        bio?: string;
        avatarUrl?: string;
        instagramUrl?: string;
        facebookUrl?: string;
        youtubeUrl?: string;
        xUrl?: string;
        twitchUrl?: string;
        kickUrl?: string;
      }
    | null;
  if (!payload?.name || !payload.name.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  const response = await fetch(`${ResolveApiBaseUrl()}/profiles/me`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  const data = (await response.json().catch(() => ({}))) as unknown;
  if (!response.ok) {
    return NextResponse.json(data, { status: response.status });
  }
  return NextResponse.json(data);
}
