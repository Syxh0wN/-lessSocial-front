import { TopBar } from "@/components/topBar";
import { auth } from "@/auth";
import { FeedTimeline } from "@/components/feedTimeline";
import { FeedFloatingActions } from "@/components/feedFloatingActions";
import { redirect } from "next/navigation";

export default async function FeedPage() {
  const session = await auth();
  const sessionUser = session?.user as
    | { username?: string; accessToken?: string; needsOnboarding?: boolean }
    | undefined;
  const username = sessionUser?.username;
  const accessToken = sessionUser?.accessToken;
  const needsOnboarding = Boolean(sessionUser?.needsOnboarding);

  if (!session || !username || !accessToken) {
    redirect("/");
  }
  if (needsOnboarding) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar username={username} />
      <main className="mx-auto flex max-w-3xl flex-col gap-4 px-6 pb-24 pt-8">
        <FeedTimeline />
      </main>
      <FeedFloatingActions />
    </div>
  );
}
