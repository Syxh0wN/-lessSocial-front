import { TopBar } from "@/components/topBar";
import { auth } from "@/auth";
import { fetchFeed } from "@/lib/api";
import { FeedPostCard } from "@/components/feedPostCard";

export default async function FeedPage() {
  const session = await auth();
  const sessionUser = session?.user as
    | { username?: string; accessToken?: string }
    | undefined;
  const username = sessionUser?.username;
  const feedItems = await fetchFeed(sessionUser?.accessToken).catch(() => []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar username={username} />
      <main className="mx-auto flex max-w-3xl flex-col gap-4 px-6 py-8">
        {feedItems.map((post) => (
          <FeedPostCard key={post.id} post={post} />
        ))}
      </main>
    </div>
  );
}
