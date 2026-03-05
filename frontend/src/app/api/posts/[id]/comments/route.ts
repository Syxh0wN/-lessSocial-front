import { auth } from "@/auth";
import { NextResponse } from "next/server";

function ResolveApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const accessToken = (session?.user as { accessToken?: string } | undefined)?.accessToken;
  const payload = (await request.json().catch(() => ({}))) as { content?: string };
  const content = payload.content?.trim() ?? "";
  if (!content) {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }
  if (!accessToken) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  const response = await fetch(`${ResolveApiBaseUrl()}/posts/${id}/comments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content,
    }),
    cache: "no-store",
  });
  if (!response.ok) {
    return NextResponse.json({ error: "comment failed" }, { status: response.status });
  }
  return NextResponse.json({ ok: true });
}
