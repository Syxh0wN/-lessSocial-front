"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type ConnectionItem = {
  username: string;
  name: string;
  avatarUrl?: string | null;
};

type ProfileConnectionsPreviewProps = {
  followers: ConnectionItem[];
  following: ConnectionItem[];
  followersCount: number;
  followingCount: number;
};

export function ProfileConnectionsPreview({
  followers,
  following,
  followersCount,
  followingCount,
}: ProfileConnectionsPreviewProps) {
  const [activeTab, setActiveTab] = useState<"following" | "followers" | null>(null);
  const previewItems = useMemo(
    () => (activeTab === "following" ? following.slice(0, 8) : followers.slice(0, 8)),
    [activeTab, followers, following],
  );
  const totalItems = activeTab === "following" ? followingCount : followersCount;

  return (
    <>
      <button
        type="button"
        onClick={() => setActiveTab((currentTab) => (currentTab === "following" ? null : "following"))}
        className="inline-flex items-center gap-2 text-muted transition hover:text-primary"
      >
        <b className="text-foreground">{followingCount}</b> Seguindo
      </button>
      <button
        type="button"
        onClick={() => setActiveTab((currentTab) => (currentTab === "followers" ? null : "followers"))}
        className="inline-flex items-center gap-2 text-muted transition hover:text-primary"
      >
        <b className="text-foreground">{followersCount}</b> Seguidores
      </button>
      {activeTab ? (
        <div className="mt-3 w-full rounded-xl border border-borderColor bg-background p-3">
          <h3 className="text-xs font-semibold text-primaryActive">
            {activeTab === "following" ? "Preview de Seguindo" : "Preview de Seguidores"}
          </h3>
          {previewItems.length === 0 ? (
            <p className="mt-2 text-xs text-muted">
              {activeTab === "following"
                ? "Voce ainda nao segue ninguem."
                : "Ainda nao ha seguidores."}
            </p>
          ) : (
            <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
              {previewItems.map((userItem) => (
                <Link
                  key={`${activeTab}_${userItem.username}`}
                  href={`/${userItem.username}`}
                  className="flex items-center gap-2 rounded-lg border border-borderColor bg-surface px-2 py-2 transition hover:border-primary"
                >
                  <img
                    src={
                      userItem.avatarUrl ??
                      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=300&auto=format&fit=crop"
                    }
                    alt={`Avatar ${userItem.username}`}
                    className="h-7 w-7 rounded-full border border-borderColor object-cover"
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-medium text-foreground">
                      {userItem.name}
                    </span>
                    <span className="block truncate text-[11px] text-muted">@{userItem.username}</span>
                  </span>
                </Link>
              ))}
            </div>
          )}
          {totalItems > previewItems.length ? (
            <p className="mt-2 text-[11px] text-muted">
              Mostrando {previewItems.length} de {totalItems}
            </p>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
