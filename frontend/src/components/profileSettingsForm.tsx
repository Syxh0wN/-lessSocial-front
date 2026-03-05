"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { type FormEvent, useState } from "react";
import { NormalizeSocialHandle } from "@/lib/socialHandles";

type ProfileSettingsFormProps = {
  initialUsername: string;
  initialName: string;
  initialBio?: string;
  initialAvatarUrl?: string;
  initialInstagramUrl?: string;
  initialFacebookUrl?: string;
  initialYoutubeUrl?: string;
  initialXUrl?: string;
  initialTwitchUrl?: string;
  initialKickUrl?: string;
  isOnboarding?: boolean;
};

export function ProfileSettingsForm({
  initialUsername,
  initialName,
  initialBio,
  initialAvatarUrl,
  initialInstagramUrl,
  initialFacebookUrl,
  initialYoutubeUrl,
  initialXUrl,
  initialTwitchUrl,
  initialKickUrl,
  isOnboarding = false,
}: ProfileSettingsFormProps) {
  const router = useRouter();
  const { update } = useSession();
  const [username, setUsername] = useState(initialUsername);
  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState(initialBio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl ?? "");
  const [instagramHandle, setInstagramHandle] = useState(NormalizeSocialHandle(initialInstagramUrl));
  const [facebookHandle, setFacebookHandle] = useState(NormalizeSocialHandle(initialFacebookUrl));
  const [youtubeHandle, setYoutubeHandle] = useState(NormalizeSocialHandle(initialYoutubeUrl));
  const [xHandle, setXHandle] = useState(NormalizeSocialHandle(initialXUrl));
  const [twitchHandle, setTwitchHandle] = useState(NormalizeSocialHandle(initialTwitchUrl));
  const [kickHandle, setKickHandle] = useState(NormalizeSocialHandle(initialKickUrl));
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [statusText, setStatusText] = useState("");

  const UploadAvatarFromDevice = async (fileItem: File) => {
    if (isUploadingAvatar) {
      return;
    }
    setIsUploadingAvatar(true);
    setStatusText("");
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", fileItem);
      const response = await fetch("/api/uploads", {
        method: "POST",
        body: uploadFormData,
      });
      if (!response.ok) {
        setStatusText("Nao foi possivel enviar avatar.");
        return;
      }
      const payload = (await response.json()) as { url?: string; type?: string };
      if (!payload.url || payload.type !== "image") {
        setStatusText("Selecione uma imagem valida para avatar.");
        return;
      }
      setAvatarUrl(payload.url);
      setStatusText("Avatar enviado com sucesso.");
    } catch {
      setStatusText("Nao foi possivel enviar avatar.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaving) {
      return;
    }
    const safeUsername = username.trim().toLowerCase();
    const safeName = name.trim();
    const safeInstagramHandle = NormalizeSocialHandle(instagramHandle);
    const safeFacebookHandle = NormalizeSocialHandle(facebookHandle);
    const safeYoutubeHandle = NormalizeSocialHandle(youtubeHandle);
    const safeXHandle = NormalizeSocialHandle(xHandle);
    const safeTwitchHandle = NormalizeSocialHandle(twitchHandle);
    const safeKickHandle = NormalizeSocialHandle(kickHandle);
    if (!safeUsername || !safeName) {
      setStatusText("Preencha username e nome.");
      return;
    }
    setIsSaving(true);
    setStatusText("");
    try {
      const response = await fetch("/api/profiles/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: safeUsername,
          name: safeName,
          bio: bio.trim() || undefined,
          avatarUrl: avatarUrl.trim() || undefined,
          instagramUrl: safeInstagramHandle || undefined,
          facebookUrl: safeFacebookHandle || undefined,
          youtubeUrl: safeYoutubeHandle || undefined,
          xUrl: safeXHandle || undefined,
          twitchUrl: safeTwitchHandle || undefined,
          kickUrl: safeKickHandle || undefined,
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        message?: string;
        user?: { username?: string };
      };
      if (!response.ok) {
        setStatusText(payload.message ?? "Nao foi possivel salvar.");
        return;
      }
      await update({
        username: safeUsername,
        needsOnboarding: false,
      });
      setStatusText("Perfil atualizado com sucesso.");
      if (isOnboarding) {
        router.push(`/${safeUsername}`);
        router.refresh();
        return;
      }
      router.refresh();
    } catch {
      setStatusText("Nao foi possivel salvar.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-3 rounded-xl border border-borderColor bg-background p-4">
      <h2 className="text-base font-semibold text-primaryActive">
        {isOnboarding ? "Complete seu perfil" : "Editar perfil"}
      </h2>
      <input
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        placeholder="username"
        maxLength={30}
        className="w-full rounded-md border border-borderColor bg-surface px-3 py-2 text-sm text-foreground"
      />
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="nome"
        maxLength={80}
        className="w-full rounded-md border border-borderColor bg-surface px-3 py-2 text-sm text-foreground"
      />
      <textarea
        value={bio}
        onChange={(event) => setBio(event.target.value)}
        placeholder="bio"
        maxLength={180}
        rows={3}
        className="w-full rounded-md border border-borderColor bg-surface px-3 py-2 text-sm text-foreground"
      />
      <div className="space-y-2">
        <label className="block text-xs font-medium text-muted">Avatar Do Dispositivo</label>
        <input
          type="file"
          accept="image/*"
          onChange={(event) => {
            const nextFile = event.target.files?.[0];
            if (!nextFile) {
              return;
            }
            void UploadAvatarFromDevice(nextFile);
          }}
          className="w-full rounded-md border border-borderColor bg-surface px-3 py-2 text-sm text-foreground"
        />
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar selecionado"
            className="h-16 w-16 rounded-full border border-borderColor object-cover"
          />
        ) : null}
      </div>
      <input
        value={instagramHandle}
        onChange={(event) => setInstagramHandle(event.target.value)}
        placeholder="@instagram"
        className="w-full rounded-md border border-borderColor bg-surface px-3 py-2 text-sm text-foreground"
      />
      <input
        value={facebookHandle}
        onChange={(event) => setFacebookHandle(event.target.value)}
        placeholder="@facebook"
        className="w-full rounded-md border border-borderColor bg-surface px-3 py-2 text-sm text-foreground"
      />
      <input
        value={youtubeHandle}
        onChange={(event) => setYoutubeHandle(event.target.value)}
        placeholder="@youtube"
        className="w-full rounded-md border border-borderColor bg-surface px-3 py-2 text-sm text-foreground"
      />
      <input
        value={xHandle}
        onChange={(event) => setXHandle(event.target.value)}
        placeholder="@x"
        className="w-full rounded-md border border-borderColor bg-surface px-3 py-2 text-sm text-foreground"
      />
      <input
        value={twitchHandle}
        onChange={(event) => setTwitchHandle(event.target.value)}
        placeholder="@twitch"
        className="w-full rounded-md border border-borderColor bg-surface px-3 py-2 text-sm text-foreground"
      />
      <input
        value={kickHandle}
        onChange={(event) => setKickHandle(event.target.value)}
        placeholder="@kick"
        className="w-full rounded-md border border-borderColor bg-surface px-3 py-2 text-sm text-foreground"
      />
      <button
        type="submit"
        disabled={isSaving || isUploadingAvatar}
        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primaryHover active:bg-primaryActive disabled:opacity-70"
      >
        {isSaving ? "Salvando..." : isOnboarding ? "Concluir cadastro" : "Salvar alteracoes"}
      </button>
      {statusText ? <p className="text-xs text-muted">{statusText}</p> : null}
    </form>
  );
}
