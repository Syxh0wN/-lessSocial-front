import { auth } from "@/auth";
import { fetchPostById } from "@/lib/api";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const session = await auth();
  const accessToken = (session?.user as { accessToken?: string } | undefined)?.accessToken;
  const post = await fetchPostById(id, accessToken);
  if (!post) {
    return NextResponse.json({ error: "post not found" }, { status: 404 });
  }
  return NextResponse.json(post);
}
