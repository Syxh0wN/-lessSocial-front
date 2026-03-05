"use client";

import type { FeedPost } from "@/lib/api";
import { MentionAutocompleteInput } from "@/components/mentionAutocompleteInput";
import { MentionText } from "@/components/mentionText";
import { SocialHandleToUrl } from "@/lib/socialHandles";
import {
  Facebook,
  Heart,
  Instagram,
  MessageCircle,
  Twitch,
  Youtube,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, type MouseEvent, useState } from "react";

type FeedPostCardProps = {
  post: FeedPost;
  allowInteractions?: boolean;
};

type FeedCardComment = {
  id: string;
  content: string;
  user: {
    username: string;
  };
};

export function FeedPostCard({ post, allowInteractions = true }: FeedPostCardProps) {
  const router = useRouter();
  const [likesCount, setLikesCount] = useState(post.likes.length);
  const [commentsCount, setCommentsCount] = useState(post.comments.length);
  const [isLiked, setIsLiked] = useState(false);
  const [isLikePending, setIsLikePending] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isCommentPending, setIsCommentPending] = useState(false);
  const [commentsList, setCommentsList] = useState<FeedCardComment[]>([]);
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const stopCardNavigation = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
  };
  const handleToggleLike = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (isLikePending) {
      return;
    }
    setIsLikePending(true);
    try {
      const response = await fetch(`/api/posts/${post.id}/likes`, {
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
    } finally {
      setIsLikePending(false);
    }
  };
  const handleCommentSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (isCommentPending) {
      return;
    }
    const safeContent = commentText.trim();
    if (!safeContent) {
      return;
    }
    setIsCommentPending(true);
    try {
      const response = await fetch(`/api/posts/${post.id}/comments`, {
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
      setCommentsList((currentItems) => [
        ...currentItems,
        {
          id: `local_${Date.now()}`,
          content: safeContent,
          user: {
            username: "voce",
          },
        },
      ]);
    } finally {
      setIsCommentPending(false);
    }
  };
  const loadCommentsList = async () => {
    if (isCommentsLoading) {
      return;
    }
    setIsCommentsLoading(true);
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "GET",
        cache: "no-store",
      });
      if (!response.ok) {
        return;
      }
      const payload = (await response.json()) as {
        comments?: FeedCardComment[];
      };
      setCommentsList(payload.comments ?? []);
    } finally {
      setIsCommentsLoading(false);
    }
  };
  const previewSocialLinks = [
    {
      key: "instagram",
      href: SocialHandleToUrl("instagram", post.user.profile?.instagramUrl),
      label: "Instagram",
      icon: <Instagram size={14} />,
    },
    {
      key: "facebook",
      href: SocialHandleToUrl("facebook", post.user.profile?.facebookUrl),
      label: "Facebook",
      icon: <Facebook size={14} />,
    },
    {
      key: "youtube",
      href: SocialHandleToUrl("youtube", post.user.profile?.youtubeUrl),
      label: "Youtube",
      icon: <Youtube size={14} />,
    },
    {
      key: "x",
      href: SocialHandleToUrl("x", post.user.profile?.xUrl),
      label: "X",
      icon: (
        <span className="inline-flex h-4 w-4 items-center justify-center text-[10px] font-bold">
          X
        </span>
      ),
    },
    {
      key: "twitch",
      href: SocialHandleToUrl("twitch", post.user.profile?.twitchUrl),
      label: "Twitch",
      icon: <Twitch size={14} />,
    },
    {
      key: "kick",
      href: SocialHandleToUrl("kick", post.user.profile?.kickUrl),
      label: "Kick",
      icon: (
        <span className="inline-flex h-4 w-4 items-center justify-center text-[10px] font-bold">
          K
        </span>
      ),
    },
  ].filter((socialItem) => Boolean(socialItem.href));

  return (
    <article
      className="cursor-pointer rounded-xl border border-borderColor bg-surface p-5"
      onClick={() => router.push(`/posts/${post.id}`)}
    >
      <div className="flex items-center gap-3">
        <div className="group relative">
          <div className="flex items-center gap-3">
            <Link
              href={`/${post.user.username}`}
              onClick={stopCardNavigation}
            >
              <img
                src={
                  post.user.avatarUrl ??
                  post.user.profile?.avatarUrl ??
                  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=300&auto=format&fit=crop"
                }
                alt={`Avatar de ${post.user.username}`}
                className="h-10 w-10 rounded-full border border-borderColor object-cover"
              />
            </Link>
            <Link
              href={`/${post.user.username}`}
              className="cursor-pointer text-sm font-medium text-muted transition hover:text-primary"
              onClick={stopCardNavigation}
            >
              @{post.user.username}
            </Link>
          </div>
          <div className="invisible absolute left-0 top-full z-20 mt-2 min-w-64 rounded-lg border border-borderColor bg-background p-3 opacity-0 shadow-md transition group-hover:visible group-hover:opacity-100">
            <div className="flex items-center gap-3">
              <img
                src={
                  post.user.avatarUrl ??
                  post.user.profile?.avatarUrl ??
                  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=300&auto=format&fit=crop"
                }
                alt={`Preview de ${post.user.username}`}
                className="h-12 w-12 rounded-full border border-borderColor object-cover"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {post.user.name ?? post.user.profile?.name ?? post.user.username}
                </p>
                <p className="truncate text-xs text-muted">@{post.user.username}</p>
              </div>
            </div>
            <p className="mt-2 line-clamp-2 text-xs text-muted">
              {post.user.bio ??
                post.user.profile?.bio ??
                "Perfil sem biografia cadastrada no momento."}
            </p>
            {previewSocialLinks.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {previewSocialLinks.map((socialItem) => (
                  <a
                    key={socialItem.key}
                    href={socialItem.href}
                    target="_blank"
                    rel="noreferrer"
                    onClick={stopCardNavigation}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-borderColor bg-surface text-muted transition hover:border-primary hover:text-primary"
                    aria-label={socialItem.label}
                    title={socialItem.label}
                  >
                    {socialItem.icon}
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <p className="mt-2 text-base">
        <MentionText text={post.caption ?? "Post sem legenda"} />
      </p>
      <div className="mt-4 grid grid-cols-1 gap-3">
        {post.media.map((mediaItem) => (
          <div key={mediaItem.id} className="overflow-hidden rounded-md border border-borderColor">
            {mediaItem.type === "image" ? (
              <img src={mediaItem.url} alt="Midia do post" className="h-auto w-full object-cover" />
            ) : (
              <video controls className="w-full" onClick={(event) => event.stopPropagation()}>
                <source src={mediaItem.url} />
              </video>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-6 text-sm text-muted">
        {allowInteractions ? (
          <>
            <button
              type="button"
              onClick={handleToggleLike}
              className={`inline-flex items-center gap-2 transition hover:text-primary ${
                isLiked ? "text-primary" : ""
              }`}
            >
              <Heart size={16} className={isLiked ? "fill-primary text-primary" : ""} />
              {likesCount} Curtidas
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                const nextValue = !showCommentForm;
                setShowCommentForm(nextValue);
                if (nextValue) {
                  void loadCommentsList();
                }
              }}
              className="inline-flex items-center gap-2 transition hover:text-primary"
            >
              <MessageCircle size={16} />
              {commentsCount} Comentarios
            </button>
          </>
        ) : (
          <>
            <span className="inline-flex items-center gap-2">
              <Heart size={16} />
              {likesCount} Curtidas
            </span>
            <span className="inline-flex items-center gap-2">
              <MessageCircle size={16} />
              {commentsCount} Comentarios
            </span>
          </>
        )}
      </div>
      {allowInteractions && showCommentForm ? (
        <form
          onSubmit={handleCommentSubmit}
          className="mt-3 flex w-full flex-col gap-2"
          onClick={stopCardNavigation}
        >
          <MentionAutocompleteInput
            value={commentText}
            onChange={setCommentText}
            placeholder="Escreva um comentario"
            className="w-full rounded-md border border-borderColor bg-background px-4 py-3 text-base text-foreground outline-none focus:outline-none focus:ring-0"
            maxLength={500}
          />
          <button
            type="submit"
            className="self-end rounded-md border border-borderColor bg-background px-4 py-2 text-xs font-medium text-foreground transition hover:bg-primarySoft"
          >
            Enviar
          </button>
        </form>
      ) : null}
      {allowInteractions && showCommentForm ? (
        <div className="mt-3 space-y-2 border-t border-borderColor pt-3">
          {isCommentsLoading ? (
            <p className="text-xs text-muted">Carregando comentarios...</p>
          ) : commentsList.length === 0 ? (
            <p className="text-xs text-muted">Sem comentarios ainda.</p>
          ) : (
            commentsList.map((commentItem) => (
              <p key={commentItem.id} className="text-sm text-muted">
                <b className="text-foreground">@{commentItem.user.username}</b> {commentItem.content}
              </p>
            ))
          )}
        </div>
      ) : null}
    </article>
  );
}
