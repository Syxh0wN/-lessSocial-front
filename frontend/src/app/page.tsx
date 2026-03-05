import Link from "next/link";
import { AuthButtons } from "@/components/authButtons";
import { TopBar } from "@/components/topBar";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();
  const username = (session?.user as { username?: string } | undefined)?.username;
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar username={username} />
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10">
        <section className="rounded-xl border border-borderColor bg-surface p-6">
          <h1 className="text-3xl font-semibold text-primaryActive">LessSocial</h1>
          <p className="mt-3 max-w-2xl text-muted">
            Projeto de rede social com foco em portfolio, incluindo perfil publico por username,
            amizade, post com foto ou video, curtidas, comentarios e depoimentos.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/feed"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primaryHover active:bg-primaryActive"
            >
              AbrirFeed
            </Link>
            <AuthButtons isAuthenticated={Boolean(session)} />
          </div>
        </section>
      </main>
    </div>
  );
}
