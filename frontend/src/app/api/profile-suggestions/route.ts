import { auth } from "@/auth";
import { NextResponse } from "next/server";

function ResolveApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/ls";
}

export async function GET(request: Request) {
  const session = await auth();
  const sessionUser = session?.user as { accessToken?: string; username?: string } | undefined;
  const accessToken = sessionUser?.accessToken;
  const username = sessionUser?.username?.trim().toLowerCase();
  const requestUrl = new URL(request.url);
  const limit = requestUrl.searchParams.get("limit") ?? "8";
  if (accessToken) {
    const privateResponse = await fetch(
      `${ResolveApiBaseUrl()}/profiles/suggestions?limit=${encodeURIComponent(limit)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      },
    );
    const privatePayload = (await privateResponse.json().catch(() => [])) as unknown;
    if (privateResponse.ok) {
      return NextResponse.json(privatePayload);
    }
  }
  const publicResponse = await fetch(
    `${ResolveApiBaseUrl()}/profiles/discover?limit=${encodeURIComponent(limit)}${
      username ? `&excludeUsername=${encodeURIComponent(username)}` : ""
    }`,
    {
      method: "GET",
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : undefined,
      cache: "no-store",
    },
  );
  const publicPayload = (await publicResponse.json().catch(() => [])) as unknown;
  if (!publicResponse.ok) {
    return NextResponse.json([], { status: 200 });
  }
  return NextResponse.json(publicPayload);
}
