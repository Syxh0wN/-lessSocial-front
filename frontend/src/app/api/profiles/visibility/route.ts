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
  const payload = (await request.json().catch(() => null)) as { isPrivate?: boolean } | null;
  if (typeof payload?.isPrivate !== "boolean") {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }
  const response = await fetch(`${ResolveApiBaseUrl()}/profiles/me/visibility`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      isPrivate: payload.isPrivate,
    }),
    cache: "no-store",
  });
  if (!response.ok) {
    return NextResponse.json({ error: "update profile visibility failed" }, { status: response.status });
  }
  const result = (await response.json()) as unknown;
  return NextResponse.json(result);
}
