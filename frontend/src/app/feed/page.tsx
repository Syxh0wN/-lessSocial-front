import { TopBar } from "@/components/topBar";
import { auth } from "@/auth";
import { FeedTimeline } from "@/components/feedTimeline";

export default async function FeedPage() {
  const session = await auth();
  const username = (session?.user as { username?: string } | undefined)?.username;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar username={username} />
      <main className="mx-auto flex max-w-3xl flex-col gap-4 px-6 py-8">
        <FeedTimeline />
      </main>
    </div>
  );
}
