import { auth } from "@/auth";
import { MentionText } from "@/components/mentionText";
import { PostDetailsInteractions } from "@/components/postDetailsInteractions";
import { fetchPostById } from "@/lib/api";
import { X } from "lucide-react";
import Link from "next/link";
import { UpdateCommentAction, UpdatePostCaptionAction } from "./actions";

type PostDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PostDetailsPage({ params }: PostDetailsPageProps) {
  const { id } = await params;
  const session = await auth();
  const sessionUser = session?.user as
    | { username?: string; accessToken?: string }
    | undefined;
  const sessionUsername = sessionUser?.username;
  const post = await fetchPostById(id, sessionUser?.accessToken);

  if (!post) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="rounded-xl border border-borderColor bg-surface p-6">
          <p>Post nao encontrado</p>
          <Link href="/feed" className="mt-4 inline-block text-primary underline">
            Voltar para o feed
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
  const postIsEdited = new Date(post.updatedAt).getTime() > new Date(post.createdAt).getTime();
  const likesUsersPreview = post.likes.map((likeItem) => ({
    username: likeItem.user.username,
    name: likeItem.user.profile?.name,
    avatarUrl: likeItem.user.profile?.avatarUrl,
    bio: likeItem.user.profile?.bio,
  }));
  const canEditPost = sessionUsername === post.user.username;
  const initiallyLiked = Boolean(
    sessionUsername && post.likes.some((likeItem) => likeItem.user.username === sessionUsername),
  );

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
                alt={`Avatar de ${post.user.username}`}
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
                  alt="Post principal"
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
                {canEditPost ? (
                  <form action={UpdatePostCaptionAction} className="space-y-2">
                    <input type="hidden" name="postId" value={post.id} />
                    <textarea
                      name="caption"
                      defaultValue={post.caption ?? ""}
                      maxLength={500}
                      rows={2}
                      className="w-full rounded-md border border-borderColor bg-background px-3 py-2 text-sm text-muted"
                    />
                    <div className="flex items-center gap-3">
                      <button
                        type="submit"
                        className="rounded-md border border-borderColor bg-background px-3 py-1 text-xs font-medium text-foreground transition hover:bg-primarySoft"
                      >
                        Salvar descricao
                      </button>
                      {postIsEdited ? (
                        <span className="text-[11px] text-muted">(editado)</span>
                      ) : null}
                    </div>
                  </form>
                ) : (
                  <p className="text-sm text-muted">
                    <MentionText text={post.caption ?? "Post sem legenda"} />{" "}
                    {postIsEdited ? <span className="text-[11px]">(editado)</span> : null}
                  </p>
                )}
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4">
                <PostDetailsInteractions
                  postId={post.id}
                  initialCommentsCount={post.comments.length}
                  initiallyLiked={initiallyLiked}
                  allowInteractions={Boolean(sessionUser?.accessToken)}
                  likesUsersPreview={likesUsersPreview}
                  totalLikesCount={post.likesCount}
                />
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
                  Comentarios
                </p>
                {post.comments.length === 0 ? (
                  <p className="text-sm text-muted">Ainda nao ha comentarios nesta postagem.</p>
                ) : (
                  post.comments.map((commentItem) => (
                    <div key={commentItem.id} className="mb-4">
                      {sessionUsername === commentItem.user.username ? (
                        <form action={UpdateCommentAction} className="space-y-2">
                          <input type="hidden" name="postId" value={post.id} />
                          <input type="hidden" name="commentId" value={commentItem.id} />
                          <p className="text-sm">
                            <span className="font-semibold">@{commentItem.user.username}</span>
                          </p>
                          <textarea
                            name="content"
                            defaultValue={commentItem.content}
                            maxLength={500}
                            rows={2}
                            className="w-full rounded-md border border-borderColor bg-background px-3 py-2 text-sm text-muted"
                          />
                          <div className="flex items-center gap-3">
                            <button
                              type="submit"
                              className="rounded-md border border-borderColor bg-background px-3 py-1 text-xs font-medium text-foreground transition hover:bg-primarySoft"
                            >
                              Salvar comentario
                            </button>
                            {new Date(commentItem.updatedAt).getTime() >
                            new Date(commentItem.createdAt).getTime() ? (
                              <span className="text-[11px] text-muted">(editado)</span>
                            ) : null}
                          </div>
                        </form>
                      ) : (
                        <p className="text-sm">
                          <span className="font-semibold">@{commentItem.user.username}</span>{" "}
                          <MentionText text={commentItem.content} />{" "}
                          {new Date(commentItem.updatedAt).getTime() >
                          new Date(commentItem.createdAt).getTime() ? (
                            <span className="text-[11px] text-muted">(editado)</span>
                          ) : null}
                        </p>
                      )}
                      {commentItem.replies.map((replyItem) => (
                        <div key={replyItem.id} className="ml-4 mt-2">
                          {sessionUsername === replyItem.user.username ? (
                            <form action={UpdateCommentAction} className="space-y-2">
                              <input type="hidden" name="postId" value={post.id} />
                              <input type="hidden" name="commentId" value={replyItem.id} />
                              <p className="text-xs text-muted">
                                <span className="font-semibold">@{replyItem.user.username}</span>
                              </p>
                              <textarea
                                name="content"
                                defaultValue={replyItem.content}
                                maxLength={500}
                                rows={2}
                                className="w-full rounded-md border border-borderColor bg-background px-3 py-2 text-xs text-muted"
                              />
                              <div className="flex items-center gap-3">
                                <button
                                  type="submit"
                                  className="rounded-md border border-borderColor bg-background px-3 py-1 text-[11px] font-medium text-foreground transition hover:bg-primarySoft"
                                >
                                  Salvar resposta
                                </button>
                                {new Date(replyItem.updatedAt).getTime() >
                                new Date(replyItem.createdAt).getTime() ? (
                                  <span className="text-[11px] text-muted">(editado)</span>
                                ) : null}
                              </div>
                            </form>
                          ) : (
                            <p className="text-xs text-muted">
                              <span className="font-semibold">@{replyItem.user.username}</span>{" "}
                              <MentionText text={replyItem.content} />{" "}
                              {new Date(replyItem.updatedAt).getTime() >
                              new Date(replyItem.createdAt).getTime() ? (
                                <span className="text-[11px] text-muted">(editado)</span>
                              ) : null}
                            </p>
                          )}
                        </div>
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
