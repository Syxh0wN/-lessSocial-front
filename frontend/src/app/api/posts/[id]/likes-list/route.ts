import { auth } from "@/auth";
import { NextResponse } from "next/server";

function ResolveApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const accessToken = (session?.user as { accessToken?: string } | undefined)?.accessToken;
  const { id } = await context.params;
  const requestUrl = new URL(request.url);
  const cursor = requestUrl.searchParams.get("cursor") ?? "";
  const limit = requestUrl.searchParams.get("limit") ?? "20";
  const likesUrl = new URL(`${ResolveApiBaseUrl()}/posts/${id}/likes`);
  likesUrl.searchParams.set("limit", limit);
  if (cursor) {
    likesUrl.searchParams.set("cursor", cursor);
  }
  const response = await fetch(likesUrl.toString(), {
    method: "GET",
    headers: accessToken
      ? {
          Authorization: `Bearer ${accessToken}`,
        }
      : undefined,
    cache: "no-store",
  });
  if (!response.ok) {
    return NextResponse.json({ error: "likes list failed" }, { status: response.status });
  }
  const payload = (await response.json()) as unknown;
  return NextResponse.json(payload);
}
