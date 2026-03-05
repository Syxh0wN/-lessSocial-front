import { TopBar } from "@/components/topBar";
import { auth } from "@/auth";
import { fetchFeed } from "@/lib/api";

export default async function FeedPage() {
  const session = await auth();
  const username = (session?.user as { username?: string } | undefined)?.username;
  const feedItems = await fetchFeed().catch(() => []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar username={username} />
      <main className="mx-auto flex max-w-3xl flex-col gap-4 px-6 py-8">
        {feedItems.map((post) => (
          <article key={post.id} className="rounded-xl border border-borderColor bg-surface p-5">
            <p className="text-sm text-muted">@{post.user.username}</p>
            <p className="mt-2 text-base">{post.caption ?? "PostSemLegenda"}</p>
            <div className="mt-4 grid grid-cols-1 gap-3">
              {post.media.map((mediaItem) => (
                <div key={mediaItem.id} className="overflow-hidden rounded-md border border-borderColor">
                  {mediaItem.type === "image" ? (
                    <img src={mediaItem.url} alt="PostMedia" className="h-auto w-full object-cover" />
                  ) : (
                    <video controls className="w-full">
                      <source src={mediaItem.url} />
                    </video>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-4 text-sm text-muted">
              <span>{post.likes.length} Curtidas</span>
              <span>{post.comments.length} Comentarios</span>
            </div>
          </article>
        ))}
      </main>
    </div>
  );
}
