"use server";

import { auth } from "@/auth";
import { apiClient } from "@/lib/api";
import { redirect } from "next/navigation";

export async function UpdatePostCaptionAction(formData: FormData) {
  const postId = String(formData.get("postId") ?? "");
  const caption = String(formData.get("caption") ?? "").trim();
  const session = await auth();
  const accessToken = (session?.user as { accessToken?: string } | undefined)?.accessToken;
  if (!postId || !caption || !accessToken) {
    redirect(`/posts/${postId}`);
  }
  await apiClient.patch(
    `/posts/${postId}`,
    { caption },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  redirect(`/posts/${postId}`);
}

export async function UpdateCommentAction(formData: FormData) {
  const postId = String(formData.get("postId") ?? "");
  const commentId = String(formData.get("commentId") ?? "");
  const content = String(formData.get("content") ?? "").trim();
  const session = await auth();
  const accessToken = (session?.user as { accessToken?: string } | undefined)?.accessToken;
  if (!postId || !commentId || !content || !accessToken) {
    redirect(`/posts/${postId}`);
  }
  await apiClient.patch(
    `/comments/${commentId}`,
    { content },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  redirect(`/posts/${postId}`);
}
