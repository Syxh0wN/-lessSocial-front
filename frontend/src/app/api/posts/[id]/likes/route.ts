import { auth } from "@/auth";
import { NextResponse } from "next/server";

function ResolveApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";
}

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const accessToken = (session?.user as { accessToken?: string } | undefined)?.accessToken;
  if (!accessToken) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  const response = await fetch(`${ResolveApiBaseUrl()}/posts/${id}/likes`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });
  if (!response.ok) {
    return NextResponse.json({ error: "like failed" }, { status: response.status });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const accessToken = (session?.user as { accessToken?: string } | undefined)?.accessToken;
  if (!accessToken) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  const response = await fetch(`${ResolveApiBaseUrl()}/posts/${id}/likes`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });
  if (!response.ok) {
    return NextResponse.json({ error: "unlike failed" }, { status: response.status });
  }
  return NextResponse.json({ ok: true });
}
