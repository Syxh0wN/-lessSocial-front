import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ProfileVisibilityControl } from "@/components/profileVisibilityControl";
import { ProfileSettingsForm } from "@/components/profileSettingsForm";
import { TopBar } from "@/components/topBar";
import { fetchProfile } from "@/lib/api";

export default async function MePage() {
  const session = await auth();
  const username = (session?.user as { username?: string } | undefined)?.username;
  const accessToken = (session?.user as { accessToken?: string } | undefined)?.accessToken;

  if (!session || !username) {
    redirect("/");
  }

  const profile = await fetchProfile(username, accessToken).catch(() => null);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar username={username} />
      <main className="mx-auto flex max-w-4xl flex-col gap-4 px-6 py-8">
        <section className="rounded-xl border border-borderColor bg-surface p-6">
          <h1 className="text-2xl font-semibold text-primaryActive">Minha Conta</h1>
          <p className="mt-2 text-sm text-muted">@{username}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={`/${username}`}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primaryHover active:bg-primaryActive"
            >
              Ver Perfil Publico
            </Link>
            <Link
              href="/feed"
              className="rounded-md border border-primary px-4 py-2 text-sm font-medium text-primary"
            >
              Abrir Feed
            </Link>
          </div>
          <ProfileSettingsForm
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
          <ProfileVisibilityControl initialIsPrivate={Boolean(profile?.isPrivate)} />
        </section>
      </main>
    </div>
  );
}
