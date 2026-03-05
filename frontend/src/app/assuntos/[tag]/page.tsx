import { auth } from "@/auth";
import { FeedPostCard } from "@/components/feedPostCard";
import { TopBar } from "@/components/topBar";
import { fetchHashtagPosts } from "@/lib/api";

type HashtagFeedPageProps = {
  params: Promise<{ tag: string }>;
};

export default async function HashtagFeedPage({ params }: HashtagFeedPageProps) {
  const { tag } = await params;
  const safeTag = decodeURIComponent(tag).toLowerCase();
  const session = await auth();
  const sessionUser = session?.user as { username?: string; accessToken?: string } | undefined;
  const hashtagPosts = await fetchHashtagPosts(safeTag, sessionUser?.accessToken);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar username={sessionUser?.username} />
      <main className="mx-auto flex max-w-3xl flex-col gap-4 px-6 py-8">
        <section className="rounded-xl border border-borderColor bg-surface p-4">
          <h1 className="text-lg font-semibold text-primaryActive">Assunto #{safeTag}</h1>
          <p className="mt-1 text-xs text-muted">Publicacoes encontradas: {hashtagPosts.length}</p>
        </section>
        {hashtagPosts.length === 0 ? (
          <div className="rounded-xl border border-borderColor bg-surface p-4 text-sm text-muted">
            Nenhuma publicacao encontrada para essa hashtag.
          </div>
        ) : (
          hashtagPosts.map((postItem) => <FeedPostCard key={postItem.id} post={postItem} />)
        )}
      </main>
    </div>
  );
}
