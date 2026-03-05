"use client";

import { FeedPostCard } from "@/components/feedPostCard";
import { FollowProfileButton } from "@/components/followProfileButton";
import type { FeedPost, FeedPageResponse, ProfileSuggestionItem } from "@/lib/api";
import Link from "next/link";
import { useSession } from "next-auth/react";
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

async function loadProfileSuggestions() {
  const response = await fetch("/api/profile-suggestions?limit=8", {
    method: "GET",
    cache: "no-store",
  });
  if (!response.ok) {
    return [];
  }
  return (await response.json()) as ProfileSuggestionItem[];
}

type ProfilePreview = {
  username: string;
  name: string;
  bio?: string;
  avatarUrl?: string | null;
};

async function loadProfilePreview(username: string) {
  const response = await fetch(`/api/profile-preview?username=${encodeURIComponent(username)}`, {
    method: "GET",
    cache: "no-store",
  });
  if (!response.ok) {
    return null;
  }
  return (await response.json()) as ProfilePreview;
}

export function FeedTimeline() {
  const { data: session } = useSession();
  const [feedItems, setFeedItems] = useState<FeedPost[]>([]);
  const [suggestionItems, setSuggestionItems] = useState<ProfileSuggestionItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hoveredUsername, setHoveredUsername] = useState<string | null>(null);
  const [previewItems, setPreviewItems] = useState<Record<string, ProfilePreview | null>>({});
  const [loadingPreviewItems, setLoadingPreviewItems] = useState<Record<string, boolean>>({});
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchInitialPage = async () => {
      const suggestionsPromise = loadProfileSuggestions().catch(() => []);
      try {
        const page = await loadFeedPage();
        if (!isMounted) {
          return;
        }
        setFeedItems(page.items);
        setNextCursor(page.nextCursor);
        setHasMore(page.hasMore);
      } catch {
        if (!isMounted) {
          return;
        }
        setFeedItems([]);
        setNextCursor(null);
        setHasMore(false);
      } finally {
        const suggestions = await suggestionsPromise;
        if (isMounted) {
          setSuggestionItems(suggestions);
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
  const currentUsername = ((session?.user as { username?: string } | undefined)?.username ?? "")
    .trim()
    .toLowerCase();
  const visibleSuggestionItems = useMemo(
    () =>
      suggestionItems.filter(
        (suggestionItem) => suggestionItem.username.trim().toLowerCase() !== currentUsername,
      ),
    [currentUsername, suggestionItems],
  );
  const handleUsernameEnter = (username: string) => {
    setHoveredUsername(username);
    if (previewItems[username] !== undefined || loadingPreviewItems[username]) {
      return;
    }
    setLoadingPreviewItems((currentItems) => ({
      ...currentItems,
      [username]: true,
    }));
    void loadProfilePreview(username)
      .then((previewItem) => {
        setPreviewItems((currentItems) => ({
          ...currentItems,
          [username]: previewItem,
        }));
      })
      .finally(() => {
        setLoadingPreviewItems((currentItems) => ({
          ...currentItems,
          [username]: false,
        }));
      });
  };

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
        Carregando Feed
      </div>
    );
  }

  return (
    <>
      {visibleSuggestionItems.length > 0 ? (
        <section className="rounded-xl border border-borderColor bg-surface p-4">
          <h2 className="text-sm font-semibold text-primaryActive">Sugestoes para seguir</h2>
          <p className="mt-1 text-xs text-muted">
            Siga alguns perfis para melhorar seu feed.
          </p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {visibleSuggestionItems.map((suggestionItem) => (
              <div
                key={suggestionItem.userId}
                className="flex flex-col gap-3 rounded-lg border border-borderColor bg-background p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <img
                    src={
                      suggestionItem.avatarUrl ??
                      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=300&auto=format&fit=crop"
                    }
                    alt={`Avatar de ${suggestionItem.username}`}
                    className="h-10 w-10 rounded-full border border-borderColor object-cover"
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-foreground">
                      {suggestionItem.name}
                    </span>
                    <span className="relative block truncate text-xs text-muted">
                      <Link
                        href={`/${suggestionItem.username}`}
                        onMouseEnter={() => handleUsernameEnter(suggestionItem.username)}
                        onMouseLeave={() => setHoveredUsername((currentItem) =>
                          currentItem === suggestionItem.username ? null : currentItem,
                        )}
                        className="inline-block hover:text-primary hover:underline"
                      >
                        @{suggestionItem.username}
                      </Link>
                      {hoveredUsername === suggestionItem.username &&
                      previewItems[suggestionItem.username] ? (
                        <span className="absolute left-0 top-full z-30 mt-2 w-64 rounded-lg border border-borderColor bg-background p-3 opacity-100 shadow-md">
                          <span className="flex items-center gap-3">
                            <img
                              src={
                                previewItems[suggestionItem.username]?.avatarUrl ??
                                "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=300&auto=format&fit=crop"
                              }
                              alt={`Preview de ${suggestionItem.username}`}
                              className="h-10 w-10 rounded-full border border-borderColor object-cover"
                            />
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-semibold text-foreground">
                                {previewItems[suggestionItem.username]?.name}
                              </span>
                              <span className="block truncate text-xs text-muted">
                                @{previewItems[suggestionItem.username]?.username}
                              </span>
                            </span>
                          </span>
                          <span className="mt-2 block line-clamp-2 text-xs text-muted">
                            {previewItems[suggestionItem.username]?.bio ??
                              "Perfil sem biografia cadastrada no momento."}
                          </span>
                        </span>
                      ) : null}
                    </span>
                  </span>
                </div>
                <FollowProfileButton targetUserId={suggestionItem.userId} isAuthenticated compact />
              </div>
            ))}
          </div>
        </section>
      ) : null}
      {feedItems.map((postItem) => (
        <FeedPostCard key={postItem.id} post={postItem} />
      ))}
      <div ref={sentinelRef} className="h-6" />
      {isLoadingMore ? (
        <div className="rounded-xl border border-borderColor bg-surface p-3 text-center text-xs text-muted">
          Carregando mais posts
        </div>
      ) : null}
      {!hasMore ? (
        <div className="rounded-xl border border-borderColor bg-surface p-3 text-center text-xs text-muted">
          Voce chegou ao fim do feed
        </div>
      ) : null}
    </>
  );
}
