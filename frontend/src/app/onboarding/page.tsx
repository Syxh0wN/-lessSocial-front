import { auth } from "@/auth";
import { ProfileSettingsForm } from "@/components/profileSettingsForm";
import { TopBar } from "@/components/topBar";
import { fetchProfile } from "@/lib/api";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
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

  if (!needsOnboarding) {
    redirect(`/${username}`);
  }

  const profile = await fetchProfile(username, accessToken).catch(() => null);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar username={username} hideHomeActions />
      <main className="mx-auto flex max-w-2xl flex-col gap-4 px-6 py-8">
        <section className="rounded-xl border border-borderColor bg-surface p-6">
          <h1 className="text-2xl font-semibold text-primaryActive">Complete seu cadastro</h1>
          <p className="mt-2 text-sm text-muted">
            Escolha seu username e adicione seus dados para finalizar.
          </p>
          <ProfileSettingsForm
            isOnboarding
            initialUsername={profile?.user.username ?? username}
            initialName={profile?.name ?? username}
            initialBio={profile?.bio}
            initialAvatarUrl={profile?.avatarUrl}
            initialInstagramUrl={profile?.instagramUrl}
            initialFacebookUrl={profile?.facebookUrl}
            initialYoutubeUrl={profile?.youtubeUrl}
            initialXUrl={profile?.xUrl}
            initialTwitchUrl={profile?.twitchUrl}
            initialKickUrl={profile?.kickUrl}
          />
        </section>
      </main>
    </div>
  );
}
