import { TopBar } from "@/components/topBar";
import { auth } from "@/auth";
import { FeedPostCard } from "@/components/feedPostCard";
import {
  fetchProfile,
  fetchProfileAlbums,
  fetchProfilePosts,
  type FeedPost,
} from "@/lib/api";
import { Album, FileImage, ImageIcon, Pencil, UserPlus, UserRound } from "lucide-react";

type ProfilePageProps = {
  params: Promise<{ username: string }>;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const session = await auth();
  const currentUsername = (session?.user as { username?: string } | undefined)?.username;
  const profile = await fetchProfile(username).catch(() => null);
  const posts = await fetchProfilePosts(username).catch(() => []);
  const albums = await fetchProfileAlbums(username).catch(() => []);
  const postCount = posts.length;
  const albumCount = albums.length;
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
              <div className="mt-4 flex flex-wrap gap-5 text-sm text-muted">
                <span className="inline-flex items-center gap-2">
                  <FileImage size={14} />
                  <b className="text-foreground">{postCount}</b> Posts
                </span>
                <span className="inline-flex items-center gap-2">
                  <ImageIcon size={14} />
                  <b className="text-foreground">{mediaCount}</b> Midias
                </span>
                <span className="inline-flex items-center gap-2">
                  <Album size={14} />
                  <b className="text-foreground">{albumCount}</b> Albuns
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-borderColor bg-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="inline-flex items-center gap-2 text-lg font-semibold">
              <FileImage size={18} />
              PostsRecentes
            </h2>
            <span className="text-sm text-muted">{postCount} itens</span>
          </div>
          {posts.length === 0 ? (
            <p className="text-sm text-muted">Nenhum post publicado ainda.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {profileFeedPosts.map((postItem) => (
                <FeedPostCard key={postItem.id} post={postItem} />
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-borderColor bg-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="inline-flex items-center gap-2 text-lg font-semibold">
              <Album size={18} />
              Albuns
            </h2>
            <span className="text-sm text-muted">{albumCount} itens</span>
          </div>
          {albums.length === 0 ? (
            <p className="text-sm text-muted">Nenhum album criado ainda.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {albums.slice(0, 4).map((albumItem: { id: string; name: string; items?: { id: string; mediaType: "image" | "video"; mediaUrl: string }[] }) => {
                const firstItem = albumItem.items?.[0];
                return (
                  <div key={albumItem.id} className="overflow-hidden rounded-xl border border-borderColor bg-background">
                    {firstItem ? (
                      firstItem.mediaType === "image" ? (
                        <img
                          src={firstItem.mediaUrl}
                          alt={`Album${albumItem.id}`}
                          className="h-36 w-full object-cover"
                        />
                      ) : (
                        <video className="h-36 w-full object-cover" muted>
                          <source src={firstItem.mediaUrl} />
                        </video>
                      )
                    ) : (
                      <div className="flex h-36 items-center justify-center text-sm text-muted">
                        SemMidia
                      </div>
                    )}
                    <div className="p-3">
                      <p className="font-medium">{albumItem.name}</p>
                      <p className="text-xs text-muted">
                        {albumItem.items?.length ?? 0} midias
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
