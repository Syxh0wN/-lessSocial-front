"use client";

import { FeedPostCard } from "@/components/feedPostCard";
import type { FeedPost, FeedPageResponse } from "@/lib/api";
import { useEffect, useMemo, useRef, useState } from "react";

async function loadFeedPage(cursor?: string) {
  const queryParams = new URLSearchParams();
  queryParams.set("limit", "8");
  if (cursor) {
    queryParams.set("cursor", cursor);
  }
  const response = await fetch(`/api/feed?${queryParams.toString()}`, {
    method: "GET",
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("FeedRequestFailed");
  }
  return (await response.json()) as FeedPageResponse;
}

export function FeedTimeline() {
  const [feedItems, setFeedItems] = useState<FeedPost[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchInitialPage = async () => {
      try {
        const page = await loadFeedPage();
        if (!isMounted) {
          return;
        }
        setFeedItems(page.items);
        setNextCursor(page.nextCursor);
        setHasMore(page.hasMore);
      } finally {
        if (isMounted) {
          setIsInitialLoading(false);
        }
      }
    };
    void fetchInitialPage();
    return () => {
      isMounted = false;
    };
  }, []);

  const canLoadMore = useMemo(
    () => hasMore && !isLoadingMore && !isInitialLoading,
    [hasMore, isInitialLoading, isLoadingMore],
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
        void loadFeedPage(nextCursor ?? undefined)
          .then((page) => {
            setFeedItems((currentItems) => [...currentItems, ...page.items]);
            setNextCursor(page.nextCursor);
            setHasMore(page.hasMore);
          })
          .finally(() => {
            setIsLoadingMore(false);
          });
      },
      {
        rootMargin: "300px",
      },
    );
    const currentTarget = sentinelRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }
    return () => {
      observer.disconnect();
    };
  }, [canLoadMore, isLoadingMore, nextCursor]);

  if (isInitialLoading) {
    return (
      <div className="rounded-xl border border-borderColor bg-surface p-4 text-sm text-muted">
        CarregandoFeed
      </div>
    );
  }

  return (
    <>
      {feedItems.map((postItem) => (
        <FeedPostCard key={postItem.id} post={postItem} />
      ))}
      <div ref={sentinelRef} className="h-6" />
      {isLoadingMore ? (
        <div className="rounded-xl border border-borderColor bg-surface p-3 text-center text-xs text-muted">
          CarregandoMaisPosts
        </div>
      ) : null}
      {!hasMore ? (
        <div className="rounded-xl border border-borderColor bg-surface p-3 text-center text-xs text-muted">
          VoceChegouAoFimDoFeed
        </div>
      ) : null}
    </>
  );
}
