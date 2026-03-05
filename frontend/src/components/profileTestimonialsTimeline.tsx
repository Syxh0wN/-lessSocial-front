"use client";

import type { TestimonialResponse } from "@/lib/api";
import { useEffect, useMemo, useRef, useState } from "react";

type ProfileTestimonialsTimelineProps = {
  username: string;
  initialItems: TestimonialResponse[];
  initialNextCursor: string | null;
  initialHasMore: boolean;
};

type TestimonialPagePayload = {
  items: TestimonialResponse[];
  hasMore: boolean;
  nextCursor: string | null;
  totalCount: number;
};

async function loadTestimonialsPage(username: string, cursor?: string) {
  const queryParams = new URLSearchParams();
  queryParams.set("username", username);
  queryParams.set("limit", "8");
  if (cursor) {
    queryParams.set("cursor", cursor);
  }
  const response = await fetch(`/api/profile-testimonials?${queryParams.toString()}`, {
    method: "GET",
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("TestimonialsLoadFailed");
  }
  return (await response.json()) as TestimonialPagePayload;
}

export function ProfileTestimonialsTimeline({
  username,
  initialItems,
  initialNextCursor,
  initialHasMore,
}: ProfileTestimonialsTimelineProps) {
  const [items, setItems] = useState<TestimonialResponse[]>(initialItems);
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const canLoadMore = useMemo(
    () => hasMore && !isLoadingMore,
    [hasMore, isLoadingMore],
  );

  useEffect(() => {
    if (!canLoadMore) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (!firstEntry?.isIntersecting || isLoadingMore) {
          return;
        }
        setIsLoadingMore(true);
        void loadTestimonialsPage(username, nextCursor ?? undefined)
          .then((page) => {
            setItems((currentItems) => [...currentItems, ...page.items]);
            setNextCursor(page.nextCursor);
            setHasMore(page.hasMore);
          })
          .finally(() => {
            setIsLoadingMore(false);
          });
      },
      {
        rootMargin: "220px",
      },
    );
    const target = sentinelRef.current;
    if (target) {
      observer.observe(target);
    }
    return () => {
      observer.disconnect();
    };
  }, [canLoadMore, isLoadingMore, nextCursor, username]);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-borderColor bg-surface p-5 text-sm text-muted">
        Nenhum depoimento aceito ainda.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((testimonialItem) => (
        <article
          key={testimonialItem.id}
          className="rounded-2xl border border-borderColor bg-surface p-4"
        >
          <div className="flex items-center gap-3">
            <img
              src={
                testimonialItem.fromUser.profile?.avatarUrl ??
                "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=300&auto=format&fit=crop"
              }
              alt={`Depoimento${testimonialItem.fromUser.username}`}
              className="h-10 w-10 rounded-full border border-borderColor object-cover"
            />
            <div>
              <p className="text-sm font-semibold">@{testimonialItem.fromUser.username}</p>
              <p className="text-[11px] text-muted">
                {new Date(testimonialItem.createdAt).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>
          <p className="mt-3 text-sm text-foreground">{testimonialItem.content}</p>
        </article>
      ))}
      <div ref={sentinelRef} className="h-5" />
      {isLoadingMore ? (
        <div className="rounded-xl border border-borderColor bg-surface p-3 text-center text-xs text-muted">
          CarregandoMaisDepoimentos
        </div>
      ) : null}
      {!hasMore ? (
        <div className="rounded-xl border border-borderColor bg-surface p-3 text-center text-xs text-muted">
          FimDosDepoimentos
        </div>
      ) : null}
    </div>
  );
}
