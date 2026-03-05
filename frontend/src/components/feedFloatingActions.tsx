"use client";

import { MessageCircle, Plus, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useRef, useState } from "react";

type ProfileSuggestion = {
  username: string;
  name: string;
  bio?: string | null;
  avatarUrl?: string | null;
};

export function FeedFloatingActions() {
  const router = useRouter();
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [composerStep, setComposerStep] = useState<"Media" | "Descricao">("Media");
  const [caption, setCaption] = useState("");
  const [selectedMediaFile, setSelectedMediaFile] = useState<File | null>(null);
  const [selectedMediaType, setSelectedMediaType] = useState<"image" | "video" | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<ProfileSuggestion[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const mediaInputRef = useRef<HTMLInputElement | null>(null);

  const handleCreatePost = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }
    if (!selectedMediaFile || !selectedMediaType) {
      return;
    }
    setIsSubmitting(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", selectedMediaFile);
      const uploadResponse = await fetch("/api/uploads", {
        method: "POST",
        body: uploadFormData,
      });
      if (!uploadResponse.ok) {
        return;
      }
      const uploadPayload = (await uploadResponse.json()) as {
        url: string;
        type: "image" | "video";
      };
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          caption: caption.trim() || undefined,
          media: [
            {
              type: uploadPayload.type,
              url: uploadPayload.url,
            },
          ],
        }),
      });
      if (!response.ok) {
        return;
      }
      setCaption("");
      setSelectedMediaFile(null);
      setSelectedMediaType(null);
      setMediaPreviewUrl(null);
      setComposerStep("Media");
      setIsComposerOpen(false);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!selectedMediaFile) {
      setMediaPreviewUrl(null);
      return;
    }
    const previewUrl = URL.createObjectURL(selectedMediaFile);
    setMediaPreviewUrl(previewUrl);
    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [selectedMediaFile]);

  useEffect(() => {
    const safeInput = searchInput.trim();
    if (!isSearchOpen || !safeInput.startsWith("@")) {
      setSearchSuggestions([]);
      return;
    }
    const query = safeInput.slice(1).trim();
    if (!query) {
      setSearchSuggestions([]);
      return;
    }
    setIsSearchLoading(true);
    const timeoutId = setTimeout(() => {
      void fetch(`/api/profile-search?query=${encodeURIComponent(query)}`, {
        method: "GET",
        cache: "no-store",
      })
        .then(async (response) => {
          if (!response.ok) {
            setSearchSuggestions([]);
            return;
          }
          const payload = (await response.json()) as ProfileSuggestion[];
          setSearchSuggestions(payload);
        })
        .catch(() => {
          setSearchSuggestions([]);
        })
        .finally(() => {
          setIsSearchLoading(false);
        });
    }, 150);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchInput, isSearchOpen]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const safeInput = searchInput.trim();
    if (!safeInput) {
      return;
    }
    if (safeInput.startsWith("@")) {
      const safeUsername = safeInput.slice(1).trim().replace(/\s+/g, "");
      if (!safeUsername) {
        return;
      }
      setIsSearchOpen(false);
      setSearchInput("");
      setSearchSuggestions([]);
      router.push(`/${encodeURIComponent(safeUsername)}`);
      return;
    }
    const safeTag = safeInput.replace(/^#/, "").trim().toLowerCase();
    if (!safeTag) {
      return;
    }
    setIsSearchOpen(false);
    setSearchInput("");
    setSearchSuggestions([]);
    router.push(`/assuntos/${encodeURIComponent(safeTag)}`);
  };

  const handleSelectProfileSuggestion = (username: string) => {
    setIsSearchOpen(false);
    setSearchInput("");
    setSearchSuggestions([]);
    router.push(`/${encodeURIComponent(username)}`);
  };

  const handleDmClick = () => {
    window.alert("DM em breve");
  };

  const handleSelectMediaFile = (nextFile: File | null) => {
    setSelectedMediaFile(nextFile);
    if (!nextFile) {
      setSelectedMediaType(null);
      return;
    }
    if (nextFile.type.startsWith("image/")) {
      setSelectedMediaType("image");
      return;
    }
    if (nextFile.type.startsWith("video/")) {
      setSelectedMediaType("video");
      return;
    }
    setSelectedMediaType(null);
  };

  return (
    <>
      {isComposerOpen ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/50 p-4 md:items-center">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-borderColor bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-borderColor px-5 py-4">
              <button
                type="button"
                onClick={() => {
                  setIsComposerOpen(false);
                  setComposerStep("Media");
                }}
                className="rounded-md p-1 text-muted transition hover:text-primary"
              >
                <X size={14} />
              </button>
              <h2 className="text-sm font-semibold text-foreground">Criar publicacao</h2>
              {composerStep === "Media" ? (
                <button
                  type="button"
                  disabled={!selectedMediaFile || !selectedMediaType}
                  onClick={() => setComposerStep("Descricao")}
                  className="text-xs font-semibold text-primary disabled:opacity-50"
                >
                  Avancar
                </button>
              ) : (
                <button
                  type="submit"
                  form="create-post-form"
                  className="text-xs font-semibold text-primary disabled:opacity-50"
                  disabled={isSubmitting || !selectedMediaFile || !selectedMediaType}
                >
                  {isSubmitting ? "Publicando" : "Compartilhar"}
                </button>
              )}
            </div>
            <form id="create-post-form" onSubmit={handleCreatePost} className="space-y-4 p-4">
              <input
                ref={mediaInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={(event) => {
                  const nextFile = event.target.files?.[0] ?? null;
                  handleSelectMediaFile(nextFile);
                }}
                className="hidden"
              />
              {composerStep === "Media" ? (
                <>
                  <div className="space-y-3">
                    <div className="relative overflow-hidden rounded-xl border border-borderColor bg-background">
                      {mediaPreviewUrl && selectedMediaType === "image" ? (
                        <img
                          src={mediaPreviewUrl}
                          alt="Preview da imagem selecionada"
                          className="aspect-square w-full object-cover"
                        />
                      ) : null}
                      {mediaPreviewUrl && selectedMediaType === "video" ? (
                        <video
                          src={mediaPreviewUrl}
                          controls
                          className="aspect-square w-full bg-black object-contain"
                        />
                      ) : null}
                      {!mediaPreviewUrl ? (
                        <div className="flex aspect-square w-full items-center justify-center">
                          <button
                            type="button"
                            onClick={() => mediaInputRef.current?.click()}
                            className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white transition hover:bg-primaryHover"
                          >
                            Selecionar Midia
                          </button>
                        </div>
                      ) : null}
                    </div>
                    {mediaPreviewUrl ? (
                      <button
                        type="button"
                        onClick={() => mediaInputRef.current?.click()}
                        className="w-full rounded-lg border border-borderColor bg-background px-3 py-2 text-xs font-medium text-foreground transition hover:bg-primarySoft"
                      >
                        Trocar Midia
                      </button>
                    ) : null}
                    {selectedMediaFile ? (
                      <p className="text-[11px] text-muted">{selectedMediaFile.name}</p>
                    ) : null}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <div className="h-14 w-14 overflow-hidden rounded-md border border-borderColor bg-background">
                      {mediaPreviewUrl && selectedMediaType === "image" ? (
                        <img
                          src={mediaPreviewUrl}
                          alt="Preview da imagem selecionada"
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                      {mediaPreviewUrl && selectedMediaType === "video" ? (
                        <video
                          src={mediaPreviewUrl}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <textarea
                      value={caption}
                      onChange={(event) => setCaption(event.target.value)}
                      maxLength={500}
                      rows={6}
                      placeholder="Escreva uma legenda..."
                      className="min-h-32 flex-1 rounded-md border-none bg-background px-3 py-2 text-sm text-foreground outline-none focus:outline-none focus:ring-0"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setComposerStep("Media")}
                    className="w-full rounded-lg border border-borderColor bg-background px-3 py-2 text-xs font-medium text-foreground transition hover:bg-primarySoft"
                  >
                    Voltar Para Midia
                  </button>
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-medium text-white transition hover:bg-primaryHover active:bg-primaryActive"
                  >
                    {isSubmitting ? "Publicando..." : "Publicar"}
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      ) : null}

      {isSearchOpen ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/50 p-4 md:items-center">
          <div className="w-full max-w-lg rounded-2xl border border-borderColor bg-surface p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-primaryActive">Pesquisar</h2>
              <button
                type="button"
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchInput("");
                  setSearchSuggestions([]);
                }}
                className="rounded-md border border-borderColor p-2 text-muted transition hover:text-primary"
              >
                <X size={14} />
              </button>
            </div>
            <form onSubmit={handleSearchSubmit} className="space-y-3">
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Use @usuario ou #assunto"
                className="w-full rounded-md border border-borderColor bg-background px-3 py-2 text-sm text-foreground outline-none focus:outline-none focus:ring-0"
                autoFocus
              />
              {searchInput.trim().startsWith("@") ? (
                <div className="max-h-64 overflow-y-auto rounded-lg border border-borderColor bg-background">
                  {isSearchLoading ? (
                    <p className="px-3 py-2 text-xs text-muted">Carregando sugestoes...</p>
                  ) : searchSuggestions.length === 0 ? (
                    <p className="px-3 py-2 text-xs text-muted">Nenhum perfil encontrado.</p>
                  ) : (
                    searchSuggestions.map((suggestionItem) => (
                      <button
                        key={suggestionItem.username}
                        type="button"
                        onClick={() => handleSelectProfileSuggestion(suggestionItem.username)}
                        className="flex w-full items-center gap-3 border-b border-borderColor px-3 py-2 text-left last:border-b-0 hover:bg-surface"
                      >
                        <img
                          src={
                            suggestionItem.avatarUrl ??
                            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=300&auto=format&fit=crop"
                          }
                          alt={`Avatar de ${suggestionItem.username}`}
                          className="h-8 w-8 rounded-full border border-borderColor object-cover"
                        />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-foreground">
                            {suggestionItem.name}
                          </span>
                          <span className="block truncate text-xs text-muted">
                            @{suggestionItem.username}
                          </span>
                          {suggestionItem.bio ? (
                            <span className="block truncate text-[11px] text-muted">
                              {suggestionItem.bio}
                            </span>
                          ) : null}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              ) : null}
              <button
                type="submit"
                className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primaryHover active:bg-primaryActive"
              >
                Pesquisar
              </button>
            </form>
          </div>
        </div>
      ) : null}

      <div className="fixed bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border border-borderColor bg-surface p-2 shadow-lg">
        <button
          type="button"
          onClick={() => {
            setIsComposerOpen(true);
            setComposerStep("Media");
          }}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white transition hover:bg-primaryHover active:bg-primaryActive"
          title="Criar publicacao"
        >
          <Plus size={16} />
        </button>
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-borderColor bg-background text-muted transition hover:text-primary"
          title="Pesquisar assuntos"
        >
          <Search size={16} />
        </button>
        <button
          type="button"
          onClick={handleDmClick}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-borderColor bg-background text-muted transition hover:text-primary"
          title="DM em breve"
        >
          <MessageCircle size={16} />
        </button>
      </div>
    </>
  );
}
