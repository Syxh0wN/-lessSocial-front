import { auth } from "@/auth";
import { fetchPostById } from "@/lib/api";
import { Heart, MessageCircle, X } from "lucide-react";
import Link from "next/link";

type PostDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PostDetailsPage({ params }: PostDetailsPageProps) {
  const { id } = await params;
  const session = await auth();
  const sessionUser = session?.user as
    | { username?: string; accessToken?: string }
    | undefined;
  const post = await fetchPostById(id, sessionUser?.accessToken);

  if (!post) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="rounded-xl border border-borderColor bg-surface p-6">
          <p>PostNaoEncontrado</p>
          <Link href="/feed" className="mt-4 inline-block text-primary underline">
            VoltarParaFeed
          </Link>
        </div>
      </div>
    );
  }

  const firstMedia = post.media[0];
  const postDateLabel = new Date(post.createdAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const visibleLikes = post.likes.slice(0, 3);
  const hiddenLikesCount = Math.max(post.likes.length - visibleLikes.length, 0);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div
        className="absolute inset-0 scale-110 bg-cover bg-center blur-2xl"
        style={{
          backgroundImage:
            firstMedia?.type === "image"
              ? `url(${firstMedia.url})`
              : "linear-gradient(135deg, #1E2A36 0%, #34516B 100%)",
          opacity: 0.35,
        }}
      />
      <div className="absolute inset-0 bg-black/20" />
      <main className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-8">
        <div className="w-full overflow-hidden rounded-2xl border border-borderColor bg-surface shadow-2xl">
          <div className="flex items-center justify-between border-b border-borderColor px-4 py-3">
            <div className="flex items-center gap-3">
              <img
                src={
                  post.user.profile?.avatarUrl ??
                  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=300&auto=format&fit=crop"
                }
                alt={`Avatar${post.user.username}`}
                className="h-10 w-10 rounded-full border border-borderColor object-cover"
              />
              <div>
                <Link href={`/${post.user.username}`} className="font-semibold hover:underline">
                  @{post.user.username}
                </Link>
                <p className="text-xs text-muted">
                  {post.user.profile?.name ?? "Usuario"}
                </p>
                <p className="text-[10px] text-muted/80">{postDateLabel}</p>
              </div>
            </div>
            <Link href="/feed" className="rounded-md p-2 transition hover:bg-primarySoft">
              <X size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-1">
            <section className="bg-black/10">
              {firstMedia?.type === "image" ? (
                <img
                  src={firstMedia.url}
                  alt="PostPrincipal"
                  className="h-full max-h-[70vh] w-full object-contain"
                />
              ) : (
                <video controls className="h-full max-h-[70vh] w-full object-contain">
                  <source src={firstMedia?.url} />
                </video>
              )}
            </section>

            <section className="flex max-h-[45vh] flex-col">
              <div className="border-b border-borderColor px-5 py-4">
                <p className="text-sm text-muted">{post.caption ?? "PostSemLegenda"}</p>
                <div className="mt-3 flex gap-6 text-sm text-muted">
                  <span className="inline-flex items-center gap-2">
                    <Heart size={16} />
                    {post.likes.length} Curtidas
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <MessageCircle size={16} />
                    {post.comments.length} Comentarios
                  </span>
                </div>
              </div>

              <div className="border-b border-borderColor px-5 py-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                  QuemCurtiu
                </p>
                {post.likes.length === 0 ? (
                  <p className="text-sm text-muted">Nenhuma curtida ainda.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {visibleLikes.map((likeItem) => (
                      <span
                        key={likeItem.id}
                        className="rounded-full border border-borderColor bg-background px-3 py-1 text-xs text-foreground"
                      >
                        @{likeItem.user.username}
                      </span>
                    ))}
                    {hiddenLikesCount > 0 ? (
                      <span className="rounded-full border border-borderColor bg-background px-3 py-1 text-xs text-muted">
                        +{hiddenLikesCount} outrasCurtidas
                      </span>
                    ) : null}
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
                  Comentarios
                </p>
                {post.comments.length === 0 ? (
                  <p className="text-sm text-muted">Ainda nao ha comentarios nesta postagem.</p>
                ) : (
                  post.comments.map((commentItem) => (
                    <div key={commentItem.id} className="mb-4">
                      <p className="text-sm">
                        <span className="font-semibold">@{commentItem.user.username}</span>{" "}
                        {commentItem.content}
                      </p>
                      {commentItem.replies.map((replyItem) => (
                        <p key={replyItem.id} className="ml-4 mt-1 text-xs text-muted">
                          <span className="font-semibold">@{replyItem.user.username}</span>{" "}
                          {replyItem.content}
                        </p>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
