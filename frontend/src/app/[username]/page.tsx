import { TopBar } from "@/components/topBar";
import { auth } from "@/auth";
import { fetchProfile, fetchProfileAlbums, fetchProfilePosts } from "@/lib/api";

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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar username={currentUsername} />
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-8">
        <section className="rounded-xl border border-borderColor bg-surface p-6">
          <h1 className="text-2xl font-semibold text-primaryActive">
            {profile?.name ?? username}
          </h1>
          <p className="mt-2 text-sm text-muted">@{username}</p>
          <p className="mt-3 text-sm">{profile?.bio ?? "SemBio"}</p>
        </section>
        <section className="rounded-xl border border-borderColor bg-surface p-6">
          <h2 className="text-lg font-semibold">Posts</h2>
          <p className="mt-1 text-sm text-muted">Total: {posts.length}</p>
        </section>
        <section className="rounded-xl border border-borderColor bg-surface p-6">
          <h2 className="text-lg font-semibold">Albuns</h2>
          <p className="mt-1 text-sm text-muted">Total: {albums.length}</p>
        </section>
      </main>
    </div>
  );
}
