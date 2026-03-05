"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type ProfilePreview = {
  username: string;
  name: string;
  bio?: string;
  avatarUrl?: string | null;
};

type MentionTokenProps = {
  username: string;
};

function MentionToken({ username }: MentionTokenProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [profilePreview, setProfilePreview] = useState<ProfilePreview | null>(null);

  const handlePointerEnter = () => {
    if (hasFetched || isLoading) {
      return;
    }
    setIsLoading(true);
    setHasFetched(true);
    void fetch(`/api/profile-preview?username=${encodeURIComponent(username)}`, {
      method: "GET",
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) {
          setProfilePreview(null);
          return;
        }
        const payload = (await response.json()) as ProfilePreview;
        setProfilePreview(payload);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <span className="group relative inline-block">
      <Link
        href={`/${username}`}
        onMouseEnter={handlePointerEnter}
        className="font-medium text-primary transition hover:underline"
      >
        @{username}
      </Link>
      {profilePreview ? (
        <span className="invisible absolute left-0 top-full z-30 mt-2 w-64 rounded-lg border border-borderColor bg-background p-3 opacity-0 shadow-md transition group-hover:visible group-hover:opacity-100">
          <span className="flex items-center gap-3">
            <img
              src={
                profilePreview.avatarUrl ??
                "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=300&auto=format&fit=crop"
              }
              alt={`Preview de ${profilePreview.username}`}
              className="h-10 w-10 rounded-full border border-borderColor object-cover"
            />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-foreground">
                {profilePreview.name}
              </span>
              <span className="block truncate text-xs text-muted">@{profilePreview.username}</span>
            </span>
          </span>
          <span className="mt-2 block line-clamp-2 text-xs text-muted">
            {profilePreview.bio ?? "Perfil sem biografia cadastrada no momento."}
          </span>
        </span>
      ) : null}
    </span>
  );
}

type MentionTextProps = {
  text: string;
};

export function MentionText({ text }: MentionTextProps) {
  const parts = useMemo(() => {
    const tokenRegex = /(@[a-zA-Z0-9_]+|#[a-zA-Z0-9_]+)/g;
    const result: Array<{ type: "text" | "mention" | "hashtag"; value: string }> = [];
    let lastIndex = 0;
    for (const matchItem of text.matchAll(tokenRegex)) {
      const matchIndex = matchItem.index ?? 0;
      if (matchIndex > lastIndex) {
        result.push({
          type: "text",
          value: text.slice(lastIndex, matchIndex),
        });
      }
      const tokenValue = matchItem[0] ?? "";
      result.push({
        type: tokenValue.startsWith("@") ? "mention" : "hashtag",
        value: tokenValue.slice(1),
      });
      lastIndex = matchIndex + tokenValue.length;
    }
    if (lastIndex < text.length) {
      result.push({
        type: "text",
        value: text.slice(lastIndex),
      });
    }
    if (result.length === 0) {
      result.push({
        type: "text",
        value: text,
      });
    }
    return result;
  }, [text]);

  return (
    <>
      {parts.map((partItem, index) =>
        partItem.type === "mention" ? (
          <MentionToken key={`${partItem.value}_${index}`} username={partItem.value} />
        ) : partItem.type === "hashtag" ? (
          <Link
            key={`${partItem.value}_${index}`}
            href={`/assuntos/${encodeURIComponent(partItem.value.toLowerCase())}`}
            className="font-medium text-primary transition hover:underline"
          >
            #{partItem.value}
          </Link>
        ) : (
          <span key={`text_${index}`}>{partItem.value}</span>
        ),
      )}
    </>
  );
}
