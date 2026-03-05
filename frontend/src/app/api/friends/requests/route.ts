import { auth } from "@/auth";
import { NextResponse } from "next/server";

function ResolveApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";
}

export async function POST(request: Request) {
  const session = await auth();
  const accessToken = (session?.user as { accessToken?: string } | undefined)?.accessToken;
  if (!accessToken) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const payload = (await request.json().catch(() => null)) as { toUserId?: string } | null;
  const toUserId = payload?.toUserId?.trim();
  if (!toUserId) {
    return NextResponse.json({ error: "toUserId is required" }, { status: 400 });
  }
  const response = await fetch(`${ResolveApiBaseUrl()}/friends/requests`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      toUserId,
    }),
    cache: "no-store",
  });
  const data = (await response.json().catch(() => ({}))) as unknown;
  if (!response.ok) {
    return NextResponse.json(data, { status: response.status });
  }
  return NextResponse.json(data);
}
