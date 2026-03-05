"use client";

import type { FeedPost } from "@/lib/api";
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
import type { MouseEvent } from "react";

type FeedPostCardProps = {
  post: FeedPost;
};

export function FeedPostCard({ post }: FeedPostCardProps) {
  const router = useRouter();
  const stopCardNavigation = (event: MouseEvent<HTMLAnchorElement>) => {
    event.stopPropagation();
  };
  const previewSocialLinks = [
    {
      key: "instagram",
      href: post.user.profile?.instagramUrl,
      label: "Instagram",
      icon: <Instagram size={14} />,
    },
    {
      key: "facebook",
      href: post.user.profile?.facebookUrl,
      label: "Facebook",
      icon: <Facebook size={14} />,
    },
    {
      key: "youtube",
      href: post.user.profile?.youtubeUrl,
      label: "Youtube",
      icon: <Youtube size={14} />,
    },
    {
      key: "x",
      href: post.user.profile?.xUrl,
      label: "X",
      icon: (
        <span className="inline-flex h-4 w-4 items-center justify-center text-[10px] font-bold">
          X
        </span>
      ),
    },
    {
      key: "twitch",
      href: post.user.profile?.twitchUrl,
      label: "Twitch",
      icon: <Twitch size={14} />,
    },
    {
      key: "kick",
      href: post.user.profile?.kickUrl,
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
                alt={`Avatar${post.user.username}`}
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
                alt={`Preview${post.user.username}`}
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
      <p className="mt-2 text-base">{post.caption ?? "PostSemLegenda"}</p>
      <div className="mt-4 grid grid-cols-1 gap-3">
        {post.media.map((mediaItem) => (
          <div key={mediaItem.id} className="overflow-hidden rounded-md border border-borderColor">
            {mediaItem.type === "image" ? (
              <img src={mediaItem.url} alt="PostMedia" className="h-auto w-full object-cover" />
            ) : (
              <video controls className="w-full" onClick={(event) => event.stopPropagation()}>
                <source src={mediaItem.url} />
              </video>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-6 text-sm text-muted">
        <span className="inline-flex cursor-pointer items-center gap-2 transition hover:text-primary">
          <Heart size={16} />
          {post.likes.length} Curtidas
        </span>
        <span className="inline-flex cursor-pointer items-center gap-2 transition hover:text-primary">
          <MessageCircle size={16} />
          {post.comments.length} Comentarios
        </span>
      </div>
    </article>
  );
}
