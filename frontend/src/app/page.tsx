import Link from "next/link";
import { AuthButtons } from "@/components/authButtons";
import { TopBar } from "@/components/topBar";
import { auth } from "@/auth";
import { Camera, MessageSquare, UserRoundCheck } from "lucide-react";

export default async function Home() {
  const session = await auth();
  const username = (session?.user as { username?: string } | undefined)?.username;
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar username={username} />
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10">
        <section className="rounded-2xl border border-borderColor bg-surface p-6 md:p-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <p className="inline-flex rounded-full border border-borderColor bg-background px-3 py-1 text-xs text-muted">
                PlataformaParaPortfolio
              </p>
              <h1 className="mt-4 text-3xl font-semibold leading-tight text-primaryActive md:text-4xl">
                ConstruaSeuPerfil
                <br />
                EMostreSeuTrabalho
              </h1>
              <p className="mt-4 max-w-xl text-sm text-muted md:text-base">
                Rede social focada em criacao de perfil publico, posts com imagem ou video,
                amizade, comentarios, curtidas e depoimentos estilo orkut.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <AuthButtons isAuthenticated={Boolean(session)} />
                <Link
                  href="/feed"
                  className="rounded-md border border-borderColor bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary"
                >
                  ExplorarFeed
                </Link>
              </div>
            </div>
            <div className="rounded-xl border border-borderColor bg-background p-5">
              <h2 className="text-lg font-semibold text-primaryActive">ComeceEm3Passos</h2>
              <ol className="mt-4 space-y-3 text-sm text-muted">
                <li className="rounded-lg border border-borderColor bg-surface p-3">
                  <b className="text-foreground">1.</b> Crie sua conta com Google em um clique
                </li>
                <li className="rounded-lg border border-borderColor bg-surface p-3">
                  <b className="text-foreground">2.</b> Personalize seu perfil e username publico
                </li>
                <li className="rounded-lg border border-borderColor bg-surface p-3">
                  <b className="text-foreground">3.</b> Publique posts e receba interacoes
                </li>
              </ol>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-borderColor bg-surface p-5">
            <div className="inline-flex rounded-md bg-primarySoft p-2 text-primary">
              <UserRoundCheck size={18} />
            </div>
            <h3 className="mt-3 text-base font-semibold">PerfilPublico</h3>
            <p className="mt-2 text-sm text-muted">
              Use seu username unico para compartilhar um link limpo do seu perfil.
            </p>
          </article>
          <article className="rounded-xl border border-borderColor bg-surface p-5">
            <div className="inline-flex rounded-md bg-primarySoft p-2 text-primary">
              <Camera size={18} />
            </div>
            <h3 className="mt-3 text-base font-semibold">PostsComMidia</h3>
            <p className="mt-2 text-sm text-muted">
              Poste fotos e videos com visual de feed moderno e foco em portfolio.
            </p>
          </article>
          <article className="rounded-xl border border-borderColor bg-surface p-5">
            <div className="inline-flex rounded-md bg-primarySoft p-2 text-primary">
              <MessageSquare size={18} />
            </div>
            <h3 className="mt-3 text-base font-semibold">Depoimentos</h3>
            <p className="mt-2 text-sm text-muted">
              Receba depoimentos aprovados no seu perfil para reforcar sua credibilidade.
            </p>
          </article>
        </section>

        <section className="rounded-xl border border-borderColor bg-surface p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-muted">
              {session
                ? "Voce ja esta autenticado. Continue para o feed e seu perfil."
                : "Entre com Google para liberar seu perfil e iniciar suas postagens."}
            </p>
            <div className="flex gap-2">
              <AuthButtons isAuthenticated={Boolean(session)} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
