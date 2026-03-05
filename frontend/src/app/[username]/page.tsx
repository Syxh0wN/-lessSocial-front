import { TopBar } from "@/components/topBar";
import { auth } from "@/auth";
import { FeedPostCard } from "@/components/feedPostCard";
import { ProfileTestimonialsTimeline } from "@/components/profileTestimonialsTimeline";
import {
  fetchProfile,
  fetchProfileAlbums,
  fetchProfilePosts,
  fetchProfileTestimonialsPage,
  type FeedPost,
} from "@/lib/api";
import {
  Facebook,
  FileImage,
  ImageIcon,
  Instagram,
  Pencil,
  Twitch,
  UserPlus,
  UserRound,
  Youtube,
} from "lucide-react";
import Link from "next/link";

type ProfilePageProps = {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function ProfilePage({
  params,
  searchParams,
}: ProfilePageProps) {
  const { username } = await params;
  const query = await searchParams;
  const activeTab = query.tab === "depoimentos" ? "depoimentos" : "posts";
  const session = await auth();
  const currentUsername = (session?.user as { username?: string } | undefined)?.username;
  const profile = await fetchProfile(username).catch(() => null);
  const posts = await fetchProfilePosts(username).catch(() => []);
  const albums = await fetchProfileAlbums(username).catch(() => []);
  const testimonialsPage = await fetchProfileTestimonialsPage(
    username,
    undefined,
    8,
  ).catch(() => ({
    items: [],
    hasMore: false,
    nextCursor: null,
    totalCount: 0,
  }));
  const testimonials = testimonialsPage.items;
  const postCount = posts.length;
  const albumCount = albums.length;
  const testimonialCount = testimonialsPage.totalCount;
  const mediaCount = posts.reduce(
    (total: number, postItem: { media?: unknown[] }) => total + (postItem.media?.length ?? 0),
    0,
  );
  const profileAvatar =
    profile?.avatarUrl ??
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=500&auto=format&fit=crop";
  const coverImage =
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1400&auto=format&fit=crop";
  const isOwnProfile = currentUsername === username;
  const socialLinks = [
    {
      key: "instagram",
      href: profile?.instagramUrl,
      label: "Instagram",
      icon: <Instagram size={16} />,
    },
    {
      key: "facebook",
      href: profile?.facebookUrl,
      label: "Facebook",
      icon: <Facebook size={16} />,
    },
    {
      key: "youtube",
      href: profile?.youtubeUrl,
      label: "Youtube",
      icon: <Youtube size={16} />,
    },
    {
      key: "x",
      href: profile?.xUrl,
      label: "X",
      icon: (
        <span className="inline-flex h-4 w-4 items-center justify-center text-[10px] font-bold">
          X
        </span>
      ),
    },
    {
      key: "twitch",
      href: profile?.twitchUrl,
      label: "Twitch",
      icon: <Twitch size={16} />,
    },
    {
      key: "kick",
      href: profile?.kickUrl,
      label: "Kick",
      icon: (
        <span className="inline-flex h-4 w-4 items-center justify-center text-[10px] font-bold">
          K
        </span>
      ),
    },
  ].filter((socialItem) => Boolean(socialItem.href));
  const profileFeedPosts: FeedPost[] = posts.map(
    (postItem: {
      id: string;
      caption?: string | null;
      media?: { id: string; type: "image" | "video"; url: string }[];
      likes?: { id: string }[];
      comments?: { id: string }[];
    }) => ({
      id: postItem.id,
      caption: postItem.caption ?? null,
      user: {
        username,
        name: profile?.name ?? username,
        bio: profile?.bio ?? undefined,
        avatarUrl: profile?.avatarUrl ?? undefined,
      },
      media: postItem.media ?? [],
      likes: postItem.likes ?? [],
      comments: postItem.comments ?? [],
    }),
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar username={currentUsername} />
      <main className="mx-auto flex max-w-5xl flex-col gap-5 px-4 py-6 md:px-6">
        <section className="overflow-hidden rounded-2xl border border-borderColor bg-surface">
          <div
            className="h-44 w-full bg-cover bg-center md:h-56"
            style={{ backgroundImage: `url(${coverImage})` }}
          />
          <div className="px-5 pb-5">
            <div className="-mt-14 flex items-end justify-between">
              <img
                src={profileAvatar}
                alt={`Avatar${username}`}
                className="h-24 w-24 rounded-full border-4 border-surface object-cover md:h-28 md:w-28"
              />
              <button className="rounded-full border border-borderColor bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-primarySoft">
                <span className="inline-flex items-center gap-2">
                  {isOwnProfile ? <Pencil size={14} /> : <UserPlus size={14} />}
                  {isOwnProfile ? "EditarPerfil" : "Seguir"}
                </span>
              </button>
            </div>
            <div className="mt-4">
              <h1 className="inline-flex items-center gap-2 text-2xl font-semibold text-primaryActive">
                <UserRound size={22} />
                {profile?.name ?? username}
              </h1>
              <p className="text-sm text-muted">@{username}</p>
              <p className="mt-3 max-w-3xl text-sm">
                {profile?.bio ?? "Perfil em construcao para o portfolio LessSocial."}
              </p>
              {socialLinks.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {socialLinks.map((socialItem) => (
                    <a
                      key={socialItem.key}
                      href={socialItem.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-borderColor bg-background text-muted transition hover:border-primary hover:text-primary"
                      aria-label={socialItem.label}
                      title={socialItem.label}
                    >
                      {socialItem.icon}
                    </a>
                  ))}
                </div>
              ) : null}
              <p className="mt-2 text-xs text-muted">
                Albuns: <b className="text-foreground">{albumCount}</b>
              </p>
              <div className="mt-4 flex flex-wrap gap-5 text-sm text-muted">
                <Link
                  href={`/${username}`}
                  className={`inline-flex items-center gap-2 transition ${
                    activeTab === "posts"
                      ? "text-primary"
                      : "text-muted hover:text-primary"
                  }`}
                >
                  <FileImage size={14} />
                  <b className="text-foreground">{postCount}</b> Posts
                </Link>
                <span className="inline-flex items-center gap-2">
                  <ImageIcon size={14} />
                  <b className="text-foreground">{mediaCount}</b> Midias
                </span>
                <Link
                  href={`/${username}?tab=depoimentos`}
                  className={`inline-flex items-center gap-2 transition ${
                    activeTab === "depoimentos"
                      ? "text-primary"
                      : "text-muted hover:text-primary"
                  }`}
                >
                  <b className="text-foreground">{testimonialCount}</b> Depoimentos
                </Link>
              </div>
            </div>
          </div>
        </section>

        {activeTab === "depoimentos" ? (
          <ProfileTestimonialsTimeline
            username={username}
            initialItems={testimonials}
            initialNextCursor={testimonialsPage.nextCursor}
            initialHasMore={testimonialsPage.hasMore}
          />
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-borderColor bg-surface p-5 text-sm text-muted">
            Nenhum post publicado ainda.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {profileFeedPosts.map((postItem) => (
              <FeedPostCard key={postItem.id} post={postItem} />
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
