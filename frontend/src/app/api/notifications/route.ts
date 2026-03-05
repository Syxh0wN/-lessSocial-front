import { auth } from "@/auth";
import { fetchNotifications } from "@/lib/api";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  const sessionUser = session?.user as { accessToken?: string } | undefined;
  const notifications = await fetchNotifications(sessionUser?.accessToken);
  return NextResponse.json(notifications);
}
