"use client";

import { Heart, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { MentionAutocompleteInput } from "@/components/mentionAutocompleteInput";
import Link from "next/link";

type PostDetailsInteractionsProps = {
  postId: string;
  initialCommentsCount: number;
  initiallyLiked: boolean;
  allowInteractions?: boolean;
  likesUsersPreview: Array<{
    username: string;
    name?: string;
    avatarUrl?: string;
    bio?: string;
  }>;
  totalLikesCount: number;
};

export function PostDetailsInteractions({
  postId,
  initialCommentsCount,
  initiallyLiked,
  allowInteractions = true,
  likesUsersPreview,
  totalLikesCount,
}: PostDetailsInteractionsProps) {
  const router = useRouter();
  const [commentsCount, setCommentsCount] = useState(initialCommentsCount);
  const [likesCount, setLikesCount] = useState(totalLikesCount);
  const [isLiked, setIsLiked] = useState(initiallyLiked);
  const [isLikePending, setIsLikePending] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isCommentPending, setIsCommentPending] = useState(false);
  const [isLikesListOpen, setIsLikesListOpen] = useState(false);
  const [likesListItems, setLikesListItems] = useState(likesUsersPreview);
  const [likesListNextCursor, setLikesListNextCursor] = useState<string | null>(null);
  const [likesListHasMore, setLikesListHasMore] = useState(false);
  const [isLikesListLoading, setIsLikesListLoading] = useState(false);
  const uniqueLikesUsers = likesUsersPreview.filter(
    (userItem, userIndex, userArray) =>
      userArray.findIndex((candidateItem) => candidateItem.username === userItem.username) === userIndex,
  );
  const likePreviewUsernames = uniqueLikesUsers.slice(0, 2).map((userItem) => userItem.username);

  const handleToggleLike = async () => {
    if (isLikePending) {
      return;
    }
    setIsLikePending(true);
    try {
      const response = await fetch(`/api/posts/${postId}/likes`, {
        method: isLiked ? "DELETE" : "POST",
      });
      if (!response.ok) {
        return;
      }
      setIsLiked((currentValue) => !currentValue);
      setLikesCount((currentCount) => {
        if (isLiked) {
          return Math.max(currentCount - 1, 0);
        }
        return currentCount + 1;
      });
      router.refresh();
    } finally {
      setIsLikePending(false);
    }
  };

  const handleSubmitComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isCommentPending) {
      return;
    }
    const safeContent = commentText.trim();
    if (!safeContent) {
      return;
    }
    setIsCommentPending(true);
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: safeContent,
        }),
      });
      if (!response.ok) {
        return;
      }
      setCommentText("");
      setCommentsCount((currentCount) => currentCount + 1);
      router.refresh();
    } finally {
      setIsCommentPending(false);
    }
  };

  const likesSummaryText =
    likePreviewUsernames.length === 0
      ? "Ninguem curtiu ainda."
      : likePreviewUsernames.length === 1
        ? `@${likePreviewUsernames[0]} curtiu`
        : likesCount > likePreviewUsernames.length
          ? `${likePreviewUsernames.map((username) => `@${username}`).join(", ")} e outras pessoas curtiram!`
          : `${likePreviewUsernames.map((username) => `@${username}`).join(", ")} curtiram!`;
  const commentsSummary = `${commentsCount} ${commentsCount === 1 ? "comentario" : "comentarios"}!`;

  const loadLikesList = async (cursor?: string) => {
    if (isLikesListLoading) {
      return;
    }
    setIsLikesListLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.set("limit", "20");
      if (cursor) {
        queryParams.set("cursor", cursor);
      }
      const response = await fetch(`/api/posts/${postId}/likes-list?${queryParams.toString()}`, {
        method: "GET",
        cache: "no-store",
      });
      if (!response.ok) {
        return;
      }
      const payload = (await response.json()) as {
        items: Array<{
          user: {
            username: string;
            profile?: {
              name?: string;
              avatarUrl?: string;
              bio?: string;
            };
          };
        }>;
        nextCursor: string | null;
        hasMore: boolean;
      };
      const mappedItems = payload.items.map((item) => ({
        username: item.user.username,
        name: item.user.profile?.name,
        avatarUrl: item.user.profile?.avatarUrl,
        bio: item.user.profile?.bio,
      }));
      setLikesListItems((currentItems) => {
        if (!cursor) {
          return mappedItems;
        }
        const mergedItems = [...currentItems, ...mappedItems];
        return mergedItems.filter(
          (item, index, array) =>
            array.findIndex((candidate) => candidate.username === item.username) === index,
        );
      });
      setLikesListNextCursor(payload.nextCursor);
      setLikesListHasMore(payload.hasMore);
    } finally {
      setIsLikesListLoading(false);
    }
  };

  return (
    <div className="mt-3 space-y-3">
      <div className="flex items-center gap-4 text-sm text-muted">
        {allowInteractions ? (
          <button
            type="button"
            onClick={handleToggleLike}
            className={`inline-flex items-center gap-2 transition hover:text-primary ${
              isLiked ? "text-primary" : ""
            }`}
          >
            <Heart size={16} className={isLiked ? "fill-primary text-primary" : ""} />
          </button>
        ) : (
          <span className="inline-flex items-center gap-2">
            <Heart size={16} />
          </span>
        )}
        <button
          type="button"
          onClick={() => {
            const nextOpenState = !isLikesListOpen;
            setIsLikesListOpen(nextOpenState);
            if (nextOpenState) {
              void loadLikesList();
            }
          }}
          className="inline-flex items-center text-xs text-muted transition hover:text-primary"
        >
          {likesSummaryText}
        </button>
        <span className="inline-flex items-center gap-2 text-xs text-muted">
          <MessageCircle size={14} />
          {commentsSummary}
        </span>
      </div>
      {isLikesListOpen ? (
        <div className="rounded-xl border border-borderColor bg-background p-3">
          <p className="mb-2 text-xs font-semibold text-muted">Pessoas que curtiram</p>
          <div className="space-y-2">
            {likesListItems.map((userItem) => (
              <Link
                key={userItem.username}
                href={`/${userItem.username}`}
                className="flex items-center gap-3 rounded-md px-2 py-2 transition hover:bg-surface"
              >
                <img
                  src={
                    userItem.avatarUrl ??
                    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=300&auto=format&fit=crop"
                  }
                  alt={`Avatar de ${userItem.username}`}
                  className="h-9 w-9 rounded-full border border-borderColor object-cover"
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {userItem.name ?? userItem.username}
                  </span>
                  <span className="block truncate text-xs text-muted">@{userItem.username}</span>
                  {userItem.bio ? (
                    <span className="block truncate text-[11px] text-muted">{userItem.bio}</span>
                  ) : null}
                </span>
              </Link>
            ))}
            {likesListHasMore ? (
              <button
                type="button"
                onClick={() => void loadLikesList(likesListNextCursor ?? undefined)}
                className="w-full rounded-md border border-borderColor bg-background px-3 py-2 text-xs text-muted transition hover:bg-surface"
              >
                {isLikesListLoading ? "Carregando..." : "Ver mais curtidas"}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
      {allowInteractions ? (
        <form onSubmit={handleSubmitComment} className="flex w-full flex-col gap-2">
          <MentionAutocompleteInput
            value={commentText}
            onChange={setCommentText}
            placeholder="Comente nesta publicacao"
            className="w-full rounded-md border border-borderColor bg-background px-4 py-3 text-base text-foreground outline-none focus:outline-none focus:ring-0"
            maxLength={500}
          />
          <button
            type="submit"
            className="self-end rounded-md border border-borderColor bg-background px-4 py-2 text-xs font-medium text-foreground transition hover:bg-primarySoft"
          >
            Comentar
          </button>
        </form>
      ) : null}
    </div>
  );
}
